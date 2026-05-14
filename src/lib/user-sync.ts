import { prisma } from './prisma';
import type { User } from '@prisma/client';

export interface StackAuthUser {
    id: string;
    primaryEmail: string | null;
    displayName: string | null;
    profileImageUrl: string | null;
}

/**
 * Sync a Stack Auth user with the database.
 * Creates a new user if they don't exist, or updates their info if they do.
 */
export async function syncUserWithDatabase(stackUser: StackAuthUser): Promise<User> {
    if (!stackUser.primaryEmail) {
        throw new Error('User must have an email address');
    }

    const user = await prisma.user.upsert({
        where: { stackAuthId: stackUser.id },
        update: {
            email: stackUser.primaryEmail,
            displayName: stackUser.displayName,
            profileImageUrl: stackUser.profileImageUrl,
            lastLoginAt: new Date(),
        },
        create: {
            stackAuthId: stackUser.id,
            email: stackUser.primaryEmail,
            displayName: stackUser.displayName,
            profileImageUrl: stackUser.profileImageUrl,
            lastLoginAt: new Date(),
        },
    });

    return user;
}

/**
 * Get a user from the database by their Stack Auth ID.
 */
export async function getUserByStackAuthId(stackAuthId: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: { stackAuthId },
    });
}

/**
 * Get a user from the database with all their relations.
 */
export async function getUserWithRelations(stackAuthId: string) {
    return prisma.user.findUnique({
        where: { stackAuthId },
        include: {
            hostedEvents: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
            staffRoles: {
                include: { event: true },
            },
            teamMemberships: {
                include: {
                    team: {
                        include: { event: true },
                    },
                },
            },
            evaluations: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
            activityLogs: {
                orderBy: { createdAt: 'desc' },
                take: 20,
            },
        },
    });
}

/**
 * Update user profile information.
 */
export async function updateUserProfile(
    stackAuthId: string,
    data: {
        displayName?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        bio?: string;
        gender?: string;
        pronouns?: string;
        phone?: string;
        location?: string;
        permanentAddress?: string;
        hobbies?: string[];
        userType?: string;
        domain?: string;
        college?: string;
        course?: string;
        specialization?: string;
        degree?: string;
        courseStartYear?: number | null;
        graduationYear?: number | null;
        courseType?: string;
        isGraduated?: boolean;
        company?: string;
        designation?: string;
        skills?: string[];
        githubUrl?: string;
        linkedinUrl?: string;
        twitterUrl?: string;
        instagramUrl?: string;
        facebookUrl?: string;
        websiteUrl?: string;
        dateOfBirth?: string | null;
        onboardingDone?: boolean;
    }
): Promise<User> {
    const { dateOfBirth, onboardingDone, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };
    if (onboardingDone !== undefined) {
        updateData.onboardingDone = onboardingDone;
    }
    if (dateOfBirth !== undefined) {
        updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    return prisma.user.update({
        where: { stackAuthId },
        data: updateData,
    });
}

/**
 * Get a user by their username.
 */
export async function getUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: { username },
    });
}

/**
 * Check if a username is available.
 */
export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return true;
    if (excludeUserId && existing.id === excludeUserId) return true;
    return false;
}

/**
 * Delete a user and all their data.
 */
export async function deleteUser(stackAuthId: string): Promise<void> {
    await prisma.user.delete({
        where: { stackAuthId },
    });
}
