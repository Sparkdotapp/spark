'use server';

import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';
import { syncUserWithDatabase } from '@/lib/user-sync';
import type {
  EventType,
  EventStatus,
  RoundStatus,
  ParticipationStatus,
  StaffRole,
  SponsorTier,
} from '@prisma/client';

// ============================================
// HELPERS
// ============================================
async function getAuthenticatedUser() {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) throw new Error('Not authenticated');

  // Ensure DB user exists
  const dbUser = await syncUserWithDatabase({
    id: stackUser.id,
    primaryEmail: stackUser.primaryEmail,
    displayName: stackUser.displayName,
    profileImageUrl: stackUser.profileImageUrl,
  });

  return dbUser;
}

async function assertEventAccess(eventId: string, userId: string, roles?: StaffRole[]) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { staff: true },
  });
  if (!event) throw new Error('Event not found');

  // Host has full access
  if (event.hostId === userId) return event;

  // Check staff role
  const staffEntry = event.staff.find((s) => s.userId === userId);
  if (!staffEntry) throw new Error('Access denied');

  if (roles && !roles.includes(staffEntry.role)) {
    throw new Error('Insufficient permissions');
  }

  return event;
}

// ============================================
// EVENT CRUD
// ============================================
export async function createEvent(data: {
  title: string;
  tagline?: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  registrationStart?: string;
  registrationEnd?: string;
  location?: string;
  isVirtual: boolean;
  virtualLink?: string;
  maxTeamSize: number;
  minTeamSize: number;
  maxParticipants?: number;
  isPublic: boolean;
  requireApproval: boolean;
  tags: string[];
  skills: string[];
  coverImage?: string;
}) {
  try {
    const user = await getAuthenticatedUser();

    const event = await prisma.event.create({
      data: {
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        registrationStart: data.registrationStart ? new Date(data.registrationStart) : null,
        registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : null,
        location: data.location,
        isVirtual: data.isVirtual,
        virtualLink: data.virtualLink,
        maxTeamSize: data.maxTeamSize,
        minTeamSize: data.minTeamSize,
        maxParticipants: data.maxParticipants,
        isPublic: data.isPublic,
        requireApproval: data.requireApproval,
        tags: data.tags,
        skills: data.skills,
        coverImage: data.coverImage,
        hostId: user.id,
        status: 'DRAFT',
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        eventId: event.id,
        userId: user.id,
        action: 'EVENT_CREATED',
        details: `Event "${event.title}" created`,
      },
    });

    return { success: true, eventId: event.id };
  } catch (error) {
    console.error('Failed to create event:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateEvent(
  eventId: string,
  data: {
    title?: string;
    tagline?: string;
    description?: string;
    type?: EventType;
    status?: EventStatus;
    startDate?: string;
    endDate?: string;
    registrationStart?: string;
    registrationEnd?: string;
    location?: string;
    isVirtual?: boolean;
    virtualLink?: string;
    maxTeamSize?: number;
    minTeamSize?: number;
    maxParticipants?: number;
    isPublic?: boolean;
    requireApproval?: boolean;
    tags?: string[];
    skills?: string[];
    coverImage?: string;
  }
) {
  try {
    const user = await getAuthenticatedUser();
    await assertEventAccess(eventId, user.id, ['ADMIN']);

    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.registrationStart) updateData.registrationStart = new Date(data.registrationStart);
    if (data.registrationEnd) updateData.registrationEnd = new Date(data.registrationEnd);

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        eventId: event.id,
        userId: user.id,
        action: 'EVENT_UPDATED',
        details: `Event updated`,
      },
    });

    return { success: true, event };
  } catch (error) {
    console.error('Failed to update event:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function publishEvent(eventId: string) {
  return updateEvent(eventId, { status: 'PUBLISHED' });
}

export async function getEvent(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: {
      host: { select: { id: true, displayName: true, email: true, profileImageUrl: true } },
      rounds: { orderBy: { roundNumber: 'asc' } },
      teams: { include: { members: { include: { user: true } } } },
      prizes: { orderBy: { position: 'asc' } },
      sponsors: true,
      staff: { include: { user: true } },
      _count: { select: { teams: true, rounds: true, activityLogs: true } },
    },
  });
}

export async function getPublicEvents(filters?: {
  type?: EventType;
  status?: EventStatus;
  search?: string;
}) {
  const where: Record<string, unknown> = {
    isPublic: true,
  };

  if (filters?.type) where.type = filters.type;
  if (filters?.status) {
    where.status = filters.status;
  } else {
    where.status = { in: ['PUBLISHED', 'ONGOING'] };
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { tagline: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.event.findMany({
    where,
    include: {
      host: { select: { id: true, displayName: true, profileImageUrl: true } },
      _count: { select: { teams: true, rounds: true } },
    },
    orderBy: { startDate: 'asc' },
  });
}

export async function getMyEvents() {
  try {
    const user = await getAuthenticatedUser();

    const [hosted, staffed] = await Promise.all([
      prisma.event.findMany({
        where: { hostId: user.id },
        include: { _count: { select: { teams: true, rounds: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.eventStaff.findMany({
        where: { userId: user.id },
        include: {
          event: {
            include: { _count: { select: { teams: true, rounds: true } } },
          },
        },
        orderBy: { addedAt: 'desc' },
      }),
    ]);

    return { success: true, hosted, staffed };
  } catch (error) {
    console.error('Failed to get my events:', error);
    return { success: false, hosted: [], staffed: [], error: (error as Error).message };
  }
}

// ============================================
// ROUND MANAGEMENT
// ============================================
export async function createRound(
  eventId: string,
  data: {
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    submissionDeadline?: string;
    criteria?: { name: string; maxScore: number; weight: number }[];
  }
) {
  try {
    const user = await getAuthenticatedUser();
    await assertEventAccess(eventId, user.id, ['ADMIN']);

    // Get next round number
    const lastRound = await prisma.round.findFirst({
      where: { eventId },
      orderBy: { roundNumber: 'desc' },
    });

    const round = await prisma.round.create({
      data: {
        eventId,
        title: data.title,
        description: data.description,
        roundNumber: (lastRound?.roundNumber ?? 0) + 1,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        submissionDeadline: data.submissionDeadline
          ? new Date(data.submissionDeadline)
          : null,
        criteria: data.criteria ?? undefined,
      },
    });

    await prisma.activityLog.create({
      data: {
        eventId,
        userId: user.id,
        action: 'ROUND_CREATED',
        details: `Round "${round.title}" (Round ${round.roundNumber}) created`,
      },
    });

    return { success: true, round };
  } catch (error) {
    console.error('Failed to create round:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateRound(
  roundId: string,
  data: {
    title?: string;
    description?: string;
    status?: RoundStatus;
    startDate?: string;
    endDate?: string;
    submissionDeadline?: string;
    criteria?: { name: string; maxScore: number; weight: number }[];
  }
) {
  try {
    const user = await getAuthenticatedUser();
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: { event: true },
    });
    if (!round) throw new Error('Round not found');
    await assertEventAccess(round.eventId, user.id, ['ADMIN']);

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.submissionDeadline) updateData.submissionDeadline = new Date(data.submissionDeadline);
    if (data.criteria !== undefined) updateData.criteria = data.criteria;

    const updated = await prisma.round.update({
      where: { id: roundId },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        eventId: round.eventId,
        userId: user.id,
        action: 'ROUND_UPDATED',
        details: `Round "${updated.title}" updated`,
      },
    });

    return { success: true, round: updated };
  } catch (error) {
    console.error('Failed to update round:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteRound(roundId: string) {
  try {
    const user = await getAuthenticatedUser();
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    if (!round) throw new Error('Round not found');
    await assertEventAccess(round.eventId, user.id, ['ADMIN']);

    await prisma.round.delete({ where: { id: roundId } });

    await prisma.activityLog.create({
      data: {
        eventId: round.eventId,
        userId: user.id,
        action: 'ROUND_DELETED',
        details: `Round "${round.title}" deleted`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete round:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ============================================
// TEAM & REGISTRATION
// ============================================
export async function registerTeam(
  eventId: string,
  data: { teamName: string; description?: string }
) {
  try {
    const user = await getAuthenticatedUser();

    // Check if user already in a team for this event
    const existing = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: { eventId },
      },
    });
    if (existing) throw new Error('You are already registered for this event');

    const team = await prisma.team.create({
      data: {
        eventId,
        name: data.teamName,
        description: data.description,
        members: {
          create: {
            userId: user.id,
            isLeader: true,
          },
        },
      },
      include: { members: { include: { user: true } } },
    });

    // Auto-register for first round if exists
    const firstRound = await prisma.round.findFirst({
      where: { eventId },
      orderBy: { roundNumber: 'asc' },
    });

    if (firstRound) {
      await prisma.roundParticipation.create({
        data: {
          roundId: firstRound.id,
          teamId: team.id,
          status: 'REGISTERED',
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        eventId,
        userId: user.id,
        action: 'TEAM_REGISTERED',
        details: `Team "${team.name}" registered`,
      },
    });

    return { success: true, team };
  } catch (error) {
    console.error('Failed to register team:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getEventParticipants(eventId: string) {
  try {
    const user = await getAuthenticatedUser();
    await assertEventAccess(eventId, user.id);

    const teams = await prisma.team.findMany({
      where: { eventId },
      include: {
        members: { include: { user: { select: { id: true, displayName: true, email: true, profileImageUrl: true } } } },
        participations: {
          include: {
            round: { select: { id: true, title: true, roundNumber: true } },
            evaluations: true,
          },
          orderBy: { round: { roundNumber: 'asc' } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, teams };
  } catch (error) {
    console.error('Failed to get participants:', error);
    return { success: false, teams: [], error: (error as Error).message };
  }
}

// ============================================
// EVALUATION
// ============================================
export async function submitEvaluation(
  participationId: string,
  data: {
    scores: { criterionName: string; score: number }[];
    feedback?: string;
  }
) {
  try {
    const user = await getAuthenticatedUser();
    const participation = await prisma.roundParticipation.findUnique({
      where: { id: participationId },
      include: { round: true },
    });
    if (!participation) throw new Error('Participation not found');
    await assertEventAccess(participation.round.eventId, user.id, ['ADMIN', 'EVALUATOR']);

    const totalScore = data.scores.reduce((sum, s) => sum + s.score, 0);

    const evaluation = await prisma.evaluation.upsert({
      where: {
        participationId_evaluatorId: {
          participationId,
          evaluatorId: user.id,
        },
      },
      update: {
        scores: data.scores,
        totalScore,
        feedback: data.feedback,
      },
      create: {
        roundId: participation.roundId,
        participationId,
        evaluatorId: user.id,
        scores: data.scores,
        totalScore,
        feedback: data.feedback,
      },
    });

    // Recalculate average score for this participation
    const allEvals = await prisma.evaluation.findMany({
      where: { participationId },
    });
    const avgScore = allEvals.reduce((sum, e) => sum + e.totalScore, 0) / allEvals.length;

    await prisma.roundParticipation.update({
      where: { id: participationId },
      data: { totalScore: avgScore, status: 'EVALUATED' },
    });

    return { success: true, evaluation };
  } catch (error) {
    console.error('Failed to submit evaluation:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function promoteTeams(roundId: string, teamIds: string[]) {
  try {
    const user = await getAuthenticatedUser();
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    if (!round) throw new Error('Round not found');
    await assertEventAccess(round.eventId, user.id, ['ADMIN']);

    // Get next round
    const nextRound = await prisma.round.findFirst({
      where: { eventId: round.eventId, roundNumber: round.roundNumber + 1 },
    });

    // Update current round participations
    await prisma.roundParticipation.updateMany({
      where: { roundId, teamId: { in: teamIds } },
      data: { status: 'PROMOTED' },
    });

    // Eliminate the rest
    await prisma.roundParticipation.updateMany({
      where: { roundId, teamId: { notIn: teamIds } },
      data: { status: 'ELIMINATED' },
    });

    // Register promoted teams in next round if it exists
    if (nextRound) {
      for (const teamId of teamIds) {
        await prisma.roundParticipation.create({
          data: {
            roundId: nextRound.id,
            teamId,
            status: 'REGISTERED',
          },
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        eventId: round.eventId,
        userId: user.id,
        action: 'TEAMS_PROMOTED',
        details: `${teamIds.length} teams promoted from Round ${round.roundNumber}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to promote teams:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ============================================
// PRIZE & SPONSOR CMS
// ============================================
export async function addPrize(
  eventId: string,
  data: { title: string; description?: string; amount?: string; position?: number; icon?: string }
) {
  try {
    const user = await getAuthenticatedUser();
    await assertEventAccess(eventId, user.id, ['ADMIN']);

    const prize = await prisma.prize.create({ data: { eventId, ...data } });
    return { success: true, prize };
  } catch (error) {
    console.error('Failed to add prize:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deletePrize(prizeId: string) {
  try {
    const user = await getAuthenticatedUser();
    const prize = await prisma.prize.findUnique({ where: { id: prizeId } });
    if (!prize) throw new Error('Prize not found');
    await assertEventAccess(prize.eventId, user.id, ['ADMIN']);

    await prisma.prize.delete({ where: { id: prizeId } });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete prize:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function addSponsor(
  eventId: string,
  data: { name: string; logoUrl?: string; websiteUrl?: string; tier: SponsorTier }
) {
  try {
    const user = await getAuthenticatedUser();
    await assertEventAccess(eventId, user.id, ['ADMIN']);

    const sponsor = await prisma.sponsor.create({ data: { eventId, ...data } });
    return { success: true, sponsor };
  } catch (error) {
    console.error('Failed to add sponsor:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteSponsor(sponsorId: string) {
  try {
    const user = await getAuthenticatedUser();
    const sponsor = await prisma.sponsor.findUnique({ where: { id: sponsorId } });
    if (!sponsor) throw new Error('Sponsor not found');
    await assertEventAccess(sponsor.eventId, user.id, ['ADMIN']);

    await prisma.sponsor.delete({ where: { id: sponsorId } });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete sponsor:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ============================================
// STAFF MANAGEMENT
// ============================================
export async function addStaff(
  eventId: string,
  data: { email: string; role: StaffRole }
) {
  try {
    const user = await getAuthenticatedUser();
    await assertEventAccess(eventId, user.id, ['ADMIN']);

    const targetUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (!targetUser) throw new Error('User not found with that email');

    const staff = await prisma.eventStaff.create({
      data: {
        eventId,
        userId: targetUser.id,
        role: data.role,
      },
      include: { user: true },
    });

    await prisma.activityLog.create({
      data: {
        eventId,
        userId: user.id,
        action: 'STAFF_ADDED',
        details: `${targetUser.displayName || targetUser.email} added as ${data.role}`,
      },
    });

    return { success: true, staff };
  } catch (error) {
    console.error('Failed to add staff:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function removeStaff(staffId: string) {
  try {
    const user = await getAuthenticatedUser();
    const staff = await prisma.eventStaff.findUnique({
      where: { id: staffId },
      include: { user: true },
    });
    if (!staff) throw new Error('Staff not found');
    await assertEventAccess(staff.eventId, user.id, ['ADMIN']);

    await prisma.eventStaff.delete({ where: { id: staffId } });

    await prisma.activityLog.create({
      data: {
        eventId: staff.eventId,
        userId: user.id,
        action: 'STAFF_REMOVED',
        details: `${staff.user.displayName || staff.user.email} removed`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to remove staff:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ============================================
// ANALYTICS & ACTIVITY LOG
// ============================================
export async function getEventAnalytics(eventId: string) {
  try {
    const user = await getAuthenticatedUser();
    await assertEventAccess(eventId, user.id);

    const [event, teams, rounds, activityLogs] = await Promise.all([
      prisma.event.findUnique({
        where: { id: eventId },
        include: {
          _count: { select: { teams: true, rounds: true, staff: true, prizes: true, sponsors: true } },
        },
      }),
      prisma.team.findMany({
        where: { eventId },
        include: { _count: { select: { members: true } } },
      }),
      prisma.round.findMany({
        where: { eventId },
        include: {
          _count: { select: { participations: true, evaluations: true } },
        },
        orderBy: { roundNumber: 'asc' },
      }),
      prisma.activityLog.findMany({
        where: { eventId },
        include: { user: { select: { displayName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const totalParticipants = teams.reduce((sum, t) => sum + t._count.members, 0);

    return {
      success: true,
      analytics: {
        event,
        totalTeams: teams.length,
        totalParticipants,
        rounds,
        recentActivity: activityLogs,
      },
    };
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return { success: false, error: (error as Error).message };
  }
}
