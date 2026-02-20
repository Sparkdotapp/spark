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
  TeamInviteStatus,
} from '@prisma/client';

// ============================================
// HELPERS
// ============================================
function generateInviteCodeString(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

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
  requireGithub?: boolean;
  requireLinkedin?: boolean;
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
        requireGithub: data.requireGithub ?? false,
        requireLinkedin: data.requireLinkedin ?? false,
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
    requiresSubmission?: boolean;
    taskDescription?: string;
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
        requiresSubmission: data.requiresSubmission ?? false,
        taskDescription: data.taskDescription || null,
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
    requiresSubmission?: boolean;
    taskDescription?: string;
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
    if (data.requiresSubmission !== undefined) updateData.requiresSubmission = data.requiresSubmission;
    if (data.taskDescription !== undefined) updateData.taskDescription = data.taskDescription;

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

    // Generate unique invite code
    let inviteCode: string;
    let attempts = 0;
    do {
      inviteCode = generateInviteCodeString();
      const existingCode = await prisma.team.findUnique({ where: { inviteCode } });
      if (!existingCode) break;
      attempts++;
    } while (attempts < 10);

    const team = await prisma.team.create({
      data: {
        eventId,
        name: data.teamName,
        description: data.description,
        inviteCode,
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
          status: 'IN_PROGRESS',
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
      data: { totalScore: avgScore },
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
      data: { status: 'SHORTLISTED' },
    });

    // Reject the rest
    await prisma.roundParticipation.updateMany({
      where: { roundId, teamId: { notIn: teamIds }, status: 'IN_PROGRESS' },
      data: { status: 'REJECTED' },
    });

    // Register shortlisted teams in next round if it exists
    if (nextRound) {
      for (const teamId of teamIds) {
        await prisma.roundParticipation.upsert({
          where: { roundId_teamId: { roundId: nextRound.id, teamId } },
          create: { roundId: nextRound.id, teamId, status: 'IN_PROGRESS' },
          update: { status: 'IN_PROGRESS' },
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        eventId: round.eventId,
        userId: user.id,
        action: 'TEAMS_PROMOTED',
        details: `${teamIds.length} teams shortlisted from Round ${round.roundNumber}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to promote teams:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ============================================
// ROUND MANAGEMENT - SHORTLIST / REJECT / ROLLBACK
// ============================================
export async function shortlistTeam(roundId: string, teamId: string) {
  try {
    const user = await getAuthenticatedUser();
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    if (!round) throw new Error('Round not found');
    await assertEventAccess(round.eventId, user.id, ['ADMIN']);

    // Update status to SHORTLISTED
    await prisma.roundParticipation.update({
      where: { roundId_teamId: { roundId, teamId } },
      data: { status: 'SHORTLISTED' },
    });

    // Auto-register in next round
    const nextRound = await prisma.round.findFirst({
      where: { eventId: round.eventId, roundNumber: round.roundNumber + 1 },
    });
    if (nextRound) {
      await prisma.roundParticipation.upsert({
        where: { roundId_teamId: { roundId: nextRound.id, teamId } },
        create: { roundId: nextRound.id, teamId, status: 'IN_PROGRESS' },
        update: { status: 'IN_PROGRESS' },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to shortlist team:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function rejectTeam(roundId: string, teamId: string) {
  try {
    const user = await getAuthenticatedUser();
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    if (!round) throw new Error('Round not found');
    await assertEventAccess(round.eventId, user.id, ['ADMIN']);

    await prisma.roundParticipation.update({
      where: { roundId_teamId: { roundId, teamId } },
      data: { status: 'REJECTED' },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to reject team:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function rollbackTeam(roundId: string, teamId: string) {
  try {
    const user = await getAuthenticatedUser();
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    if (!round) throw new Error('Round not found');
    await assertEventAccess(round.eventId, user.id, ['ADMIN']);

    const participation = await prisma.roundParticipation.findUnique({
      where: { roundId_teamId: { roundId, teamId } },
    });
    if (!participation) throw new Error('Participation not found');

    if (participation.status === 'SHORTLISTED' || participation.status === 'REJECTED') {
      // Rollback to IN_PROGRESS in same round
      await prisma.roundParticipation.update({
        where: { roundId_teamId: { roundId, teamId } },
        data: { status: 'IN_PROGRESS' },
      });

      // If was shortlisted, also remove from next round
      if (participation.status === 'SHORTLISTED') {
        const nextRound = await prisma.round.findFirst({
          where: { eventId: round.eventId, roundNumber: round.roundNumber + 1 },
        });
        if (nextRound) {
          await prisma.roundParticipation.deleteMany({
            where: { roundId: nextRound.id, teamId },
          });
        }
      }
    } else if (participation.status === 'IN_PROGRESS') {
      // Rollback to previous round's IN_PROGRESS
      if (round.roundNumber <= 1) throw new Error('Cannot rollback from first round');
      const prevRound = await prisma.round.findFirst({
        where: { eventId: round.eventId, roundNumber: round.roundNumber - 1 },
      });
      if (!prevRound) throw new Error('Previous round not found');

      // Delete from current round
      await prisma.roundParticipation.delete({
        where: { roundId_teamId: { roundId, teamId } },
      });

      // Set back to IN_PROGRESS in prev round
      await prisma.roundParticipation.update({
        where: { roundId_teamId: { roundId: prevRound.id, teamId } },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to rollback team:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function declareResult(roundId: string, resultType: 'shortlisted' | 'rejected') {
  try {
    const user = await getAuthenticatedUser();
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    if (!round) throw new Error('Round not found');
    await assertEventAccess(round.eventId, user.id, ['ADMIN']);

    const status = resultType === 'shortlisted' ? 'SHORTLISTED' : 'REJECTED';
    const count = await prisma.roundParticipation.count({
      where: { roundId, status },
    });

    // Mark round as completed if declaring results
    await prisma.round.update({
      where: { id: roundId },
      data: { status: 'COMPLETED' },
    });

    await prisma.activityLog.create({
      data: {
        eventId: round.eventId,
        userId: user.id,
        action: 'RESULT_DECLARED',
        details: `Round ${round.roundNumber} "${round.title}" — ${resultType} results declared (${count} teams)`,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error('Failed to declare result:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getRoundParticipants(roundId: string) {
  try {
    const user = await getAuthenticatedUser();
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    if (!round) throw new Error('Round not found');
    await assertEventAccess(round.eventId, user.id);

    const participations = await prisma.roundParticipation.findMany({
      where: { roundId },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profileImageUrl: true,
                    dateOfBirth: true,
                    phone: true,
                    college: true,
                    course: true,
                    specialization: true,
                    degree: true,
                    courseStartYear: true,
                    graduationYear: true,
                    courseType: true,
                    isGraduated: true,
                    company: true,
                    designation: true,
                    location: true,
                    userType: true,
                    githubUrl: true,
                    linkedinUrl: true,
                    bio: true,
                  },
                },
              },
              orderBy: { isLeader: 'desc' },
            },
          },
        },
        evaluations: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, participations };
  } catch (error) {
    console.error('Failed to get round participants:', error);
    return { success: false, participations: [], error: (error as Error).message };
  }
}

export async function submitRoundEntry(
  roundId: string,
  teamId: string,
  data: { submissionUrl?: string; submissionNotes?: string }
) {
  try {
    const user = await getAuthenticatedUser();

    // Verify user is in this team
    const member = await prisma.teamMember.findFirst({
      where: { teamId, userId: user.id },
    });
    if (!member) throw new Error('You are not a member of this team');

    await prisma.roundParticipation.update({
      where: { roundId_teamId: { roundId, teamId } },
      data: {
        submissionUrl: data.submissionUrl || null,
        submissionNotes: data.submissionNotes || null,
        submittedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to submit round entry:', error);
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

// ============================================
// TEAM MANAGEMENT
// ============================================
export async function getMyTeamForEvent(eventId: string) {
  try {
    const user = await getAuthenticatedUser();
    const membership = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: { eventId },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            inviteCode: true,
            isSubmitted: true,
            eventId: true,
            createdAt: true,
            updatedAt: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    email: true,
                    profileImageUrl: true,
                  },
                },
              },
              orderBy: { joinedAt: 'asc' },
            },
          },
        },
      },
    });

    return {
      success: true,
      team: membership?.team || null,
      isLeader: membership?.isLeader || false,
    };
  } catch {
    return { success: true, team: null, isLeader: false };
  }
}

export async function addTeamMember(teamId: string, email: string) {
  try {
    const user = await getAuthenticatedUser();
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        event: { select: { maxTeamSize: true, id: true } },
      },
    });
    if (!team) throw new Error('Team not found');

    const self = team.members.find((m) => m.userId === user.id);
    if (!self?.isLeader) throw new Error('Only the team leader can add members');

    if (team.members.length >= team.event.maxTeamSize) {
      throw new Error(`Team is at maximum capacity (${team.event.maxTeamSize} members)`);
    }

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) throw new Error('No user found with that email');

    const existing = await prisma.teamMember.findFirst({
      where: { userId: targetUser.id, team: { eventId: team.eventId } },
    });
    if (existing) throw new Error('This user is already in a team for this event');

    await prisma.teamMember.create({
      data: { teamId, userId: targetUser.id },
    });

    await prisma.activityLog.create({
      data: {
        eventId: team.eventId,
        userId: user.id,
        action: 'MEMBER_ADDED',
        details: `${targetUser.displayName || targetUser.email} added to "${team.name}"`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to add team member:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function removeTeamMember(teamId: string, memberId: string) {
  try {
    const user = await getAuthenticatedUser();
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { include: { user: true } } },
    });
    if (!team) throw new Error('Team not found');

    const self = team.members.find((m) => m.userId === user.id);
    if (!self?.isLeader) throw new Error('Only the team leader can remove members');

    const target = team.members.find((m) => m.id === memberId);
    if (!target) throw new Error('Member not found');
    if (target.isLeader) throw new Error('Cannot remove the team leader');

    await prisma.teamMember.delete({ where: { id: memberId } });

    await prisma.activityLog.create({
      data: {
        eventId: team.eventId,
        userId: user.id,
        action: 'MEMBER_REMOVED',
        details: `${target.user.displayName || target.user.email} removed from "${team.name}"`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to remove team member:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function leaveTeam(teamId: string) {
  try {
    const user = await getAuthenticatedUser();
    const membership = await prisma.teamMember.findFirst({
      where: { teamId, userId: user.id },
    });
    if (!membership) throw new Error('You are not in this team');
    if (membership.isLeader) throw new Error('Team leader cannot leave. Delete the team instead.');

    await prisma.teamMember.delete({ where: { id: membership.id } });

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (team) {
      await prisma.activityLog.create({
        data: {
          eventId: team.eventId,
          userId: user.id,
          action: 'MEMBER_LEFT',
          details: `Left team "${team.name}"`,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to leave team:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTeam(teamId: string) {
  try {
    const user = await getAuthenticatedUser();
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    if (!team) throw new Error('Team not found');

    const self = team.members.find((m) => m.userId === user.id);
    if (!self?.isLeader) throw new Error('Only the team leader can delete the team');

    const teamName = team.name;
    const eventId = team.eventId;

    await prisma.team.delete({ where: { id: teamId } });

    await prisma.activityLog.create({
      data: {
        eventId,
        userId: user.id,
        action: 'TEAM_DELETED',
        details: `Team "${teamName}" was deleted`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete team:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function joinTeamByCode(eventId: string, code: string) {
  try {
    const user = await getAuthenticatedUser();
    
    const team = await prisma.team.findFirst({
      where: { inviteCode: code.toUpperCase(), eventId },
      include: { members: true, event: { select: { maxTeamSize: true } } },
    });
    if (!team) throw new Error('Invalid invite code');

    if (team.isSubmitted) {
      throw new Error('This team has already been submitted and is no longer accepting new members');
    }

    if (team.members.length >= team.event.maxTeamSize) {
      throw new Error('This team is already full');
    }

    const existing = await prisma.teamMember.findFirst({
      where: { userId: user.id, team: { eventId: team.eventId } },
    });
    if (existing) throw new Error('You are already in a team for this event');

    // Join team (code remains valid until team is submitted)
    await prisma.teamMember.create({
      data: { teamId: team.id, userId: user.id },
    });

    await prisma.activityLog.create({
      data: {
        eventId: team.eventId,
        userId: user.id,
        action: 'TEAM_JOINED',
        details: `Joined team "${team.name}" via invite code`,
      },
    });

    return { success: true, teamName: team.name };
  } catch (error) {
    console.error('Failed to join team by code:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function regenerateInviteCode(teamId: string) {
  try {
    const user = await getAuthenticatedUser();
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    if (!team) throw new Error('Team not found');

    const self = team.members.find((m) => m.userId === user.id);
    if (!self?.isLeader) throw new Error('Only the team leader can regenerate invite code');

    // Generate new unique code
    let inviteCode: string;
    let attempts = 0;
    do {
      inviteCode = generateInviteCodeString();
      const existingCode = await prisma.team.findUnique({ where: { inviteCode } });
      if (!existingCode) break;
      attempts++;
    } while (attempts < 10);

    await prisma.team.update({
      where: { id: teamId },
      data: { inviteCode },
    });

    return { success: true, inviteCode };
  } catch (error) {
    console.error('Failed to regenerate invite code:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ============================================
// TEAM INVITE SYSTEM
// ============================================
export async function sendTeamInvite(teamId: string, email: string) {
  try {
    const user = await getAuthenticatedUser();
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        event: { select: { maxTeamSize: true, id: true } },
      },
    });
    if (!team) throw new Error('Team not found');
    if (team.isSubmitted) throw new Error('Team is already submitted');

    const self = team.members.find((m) => m.userId === user.id);
    if (!self?.isLeader) throw new Error('Only the team leader can send invites');

    if (team.members.length >= team.event.maxTeamSize) {
      throw new Error(`Team is at maximum capacity (${team.event.maxTeamSize} members)`);
    }

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) throw new Error('No user found with that email');

    if (targetUser.id === user.id) throw new Error('You cannot invite yourself');

    const existingMember = await prisma.teamMember.findFirst({
      where: { userId: targetUser.id, team: { eventId: team.eventId } },
    });
    if (existingMember) throw new Error('This user is already in a team for this event');

    // Check for existing pending invite
    const existingInvite = await prisma.teamInvite.findUnique({
      where: { teamId_invitedUserId: { teamId, invitedUserId: targetUser.id } },
    });
    if (existingInvite && existingInvite.status === 'PENDING') {
      throw new Error('An invite has already been sent to this user');
    }

    // Upsert invite (in case a previously rejected invite exists)
    await prisma.teamInvite.upsert({
      where: { teamId_invitedUserId: { teamId, invitedUserId: targetUser.id } },
      update: { status: 'PENDING', invitedByUserId: user.id },
      create: {
        teamId,
        invitedUserId: targetUser.id,
        invitedByUserId: user.id,
        status: 'PENDING',
      },
    });

    await prisma.activityLog.create({
      data: {
        eventId: team.eventId,
        userId: user.id,
        action: 'INVITE_SENT',
        details: `Invite sent to ${targetUser.displayName || targetUser.email} for team "${team.name}"`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send invite:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getMyInvitesForEvent(eventId: string) {
  try {
    const user = await getAuthenticatedUser();
    const invites = await prisma.teamInvite.findMany({
      where: {
        invitedUserId: user.id,
        status: 'PENDING',
        team: { eventId },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            members: {
              include: {
                user: { select: { id: true, displayName: true, email: true, profileImageUrl: true } },
              },
            },
            event: { select: { maxTeamSize: true, minTeamSize: true } },
          },
        },
        invitedByUser: {
          select: { displayName: true, email: true, profileImageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, invites };
  } catch {
    return { success: true, invites: [] };
  }
}

export async function getPendingInvitesForTeam(teamId: string) {
  try {
    const user = await getAuthenticatedUser();
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    if (!team) throw new Error('Team not found');

    const self = team.members.find((m) => m.userId === user.id);
    if (!self?.isLeader) throw new Error('Only the leader can view pending invites');

    const invites = await prisma.teamInvite.findMany({
      where: { teamId, status: 'PENDING' },
      include: {
        invitedUser: {
          select: { id: true, displayName: true, email: true, profileImageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, invites };
  } catch (error) {
    console.error('Failed to get pending invites:', error);
    return { success: false, invites: [], error: (error as Error).message };
  }
}

export async function acceptTeamInvite(inviteId: string) {
  try {
    const user = await getAuthenticatedUser();
    const invite = await prisma.teamInvite.findUnique({
      where: { id: inviteId },
      include: {
        team: {
          include: {
            members: true,
            event: { select: { maxTeamSize: true, id: true } },
          },
        },
      },
    });
    if (!invite) throw new Error('Invite not found');
    if (invite.invitedUserId !== user.id) throw new Error('This invite is not for you');
    if (invite.status !== 'PENDING') throw new Error('Invite is no longer pending');
    if (invite.team.isSubmitted) throw new Error('Team is already submitted');

    if (invite.team.members.length >= invite.team.event.maxTeamSize) {
      throw new Error('Team is already full');
    }

    // Check if user already in a team for this event
    const existing = await prisma.teamMember.findFirst({
      where: { userId: user.id, team: { eventId: invite.team.eventId } },
    });
    if (existing) throw new Error('You are already in a team for this event');

    // Add to team and update invite status
    await prisma.teamMember.create({
      data: { teamId: invite.teamId, userId: user.id },
    });

    await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status: 'ACCEPTED' },
    });

    await prisma.activityLog.create({
      data: {
        eventId: invite.team.eventId,
        userId: user.id,
        action: 'INVITE_ACCEPTED',
        details: `Accepted invite to team "${invite.team.name}"`,
      },
    });

    return { success: true, teamName: invite.team.name };
  } catch (error) {
    console.error('Failed to accept invite:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function rejectTeamInvite(inviteId: string) {
  try {
    const user = await getAuthenticatedUser();
    const invite = await prisma.teamInvite.findUnique({
      where: { id: inviteId },
      include: { team: true },
    });
    if (!invite) throw new Error('Invite not found');
    if (invite.invitedUserId !== user.id) throw new Error('This invite is not for you');
    if (invite.status !== 'PENDING') throw new Error('Invite is no longer pending');

    await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status: 'REJECTED' },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to reject invite:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function cancelTeamInvite(inviteId: string) {
  try {
    const user = await getAuthenticatedUser();
    const invite = await prisma.teamInvite.findUnique({
      where: { id: inviteId },
      include: { team: { include: { members: true } } },
    });
    if (!invite) throw new Error('Invite not found');

    const self = invite.team.members.find((m) => m.userId === user.id);
    if (!self?.isLeader) throw new Error('Only the team leader can cancel invites');

    await prisma.teamInvite.delete({ where: { id: inviteId } });

    return { success: true };
  } catch (error) {
    console.error('Failed to cancel invite:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function submitTeam(teamId: string) {
  try {
    const user = await getAuthenticatedUser();
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        event: { select: { minTeamSize: true, id: true } },
      },
    });
    if (!team) throw new Error('Team not found');

    const self = team.members.find((m) => m.userId === user.id);
    if (!self?.isLeader) throw new Error('Only the team leader can submit the team');

    if (team.isSubmitted) throw new Error('Team is already submitted');

    if (team.members.length < team.event.minTeamSize) {
      throw new Error(`Team needs at least ${team.event.minTeamSize} members to submit`);
    }

    // Submit team: set flag, delete invite code, cancel pending invites
    await prisma.team.update({
      where: { id: teamId },
      data: { isSubmitted: true, inviteCode: null },
    });

    // Cancel all pending invites
    await prisma.teamInvite.updateMany({
      where: { teamId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });

    await prisma.activityLog.create({
      data: {
        eventId: team.eventId,
        userId: user.id,
        action: 'TEAM_SUBMITTED',
        details: `Team "${team.name}" submitted`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to submit team:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getMyParticipatingEvents() {
  try {
    const user = await getAuthenticatedUser();
    const memberships = await prisma.teamMember.findMany({
      where: { userId: user.id },
      include: {
        team: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
                startDate: true,
                coverImage: true,
              },
            },
          },
        },
      },
    });

    const events = memberships.map((m) => m.team.event);
    // Deduplicate by event id
    const unique = Array.from(new Map(events.map((e) => [e.id, e])).values());

    return { success: true, events: unique };
  } catch (error) {
    console.error('Failed to get participating events:', error);
    return { success: false, events: [], error: (error as Error).message };
  }
}
