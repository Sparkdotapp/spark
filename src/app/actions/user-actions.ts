'use server';

import { stackServerApp } from '@/stack/server';
import { syncUserWithDatabase, getUserByStackAuthId, updateUserProfile, getUserByUsername, isUsernameAvailable } from '@/lib/user-sync';
import { prisma } from '@/lib/prisma';

/**
 * Server action to sync the current authenticated user with the database.
 * Call this after login or on protected pages to ensure user data is synced.
 */
export async function syncCurrentUser() {
    const stackUser = await stackServerApp.getUser();

    if (!stackUser) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const dbUser = await syncUserWithDatabase({
            id: stackUser.id,
            primaryEmail: stackUser.primaryEmail,
            displayName: stackUser.displayName,
            profileImageUrl: stackUser.profileImageUrl,
        });

        return { success: true, user: dbUser };
    } catch (error) {
        console.error('Failed to sync user:', error);
        return { success: false, error: 'Failed to sync user data' };
    }
}

/**
 * Get the current user's database record.
 */
export async function getCurrentDbUser() {
    const stackUser = await stackServerApp.getUser();

    if (!stackUser) {
        return null;
    }

    return getUserByStackAuthId(stackUser.id);
}

/**
 * Update the current user's profile.
 */
export async function updateCurrentUserProfile(data: {
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
}) {
    const stackUser = await stackServerApp.getUser();

    if (!stackUser) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // If username is being set, validate it
        if (data.username) {
            const dbUser = await getUserByStackAuthId(stackUser.id);
            const available = await isUsernameAvailable(data.username, dbUser?.id);
            if (!available) {
                return { success: false, error: 'Username is already taken' };
            }
        }

        const updatedUser = await updateUserProfile(stackUser.id, data);
        return { success: true, user: updatedUser };
    } catch (error) {
        console.error('Failed to update profile:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

/**
 * Check if a username is available.
 */
export async function checkUsernameAvailability(username: string) {
    const stackUser = await stackServerApp.getUser();
    const dbUser = stackUser ? await getUserByStackAuthId(stackUser.id) : null;
    const available = await isUsernameAvailable(username, dbUser?.id ?? undefined);
    return { available };
}

/**
 * Get a user's public profile by username.
 */
export async function getUserProfileByUsername(username: string) {
    const user = await getUserByUsername(username);
    if (!user) return null;

    // Get post count
    const postCount = await prisma.post.count({ where: { authorId: user.id } });

    return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location,
        college: user.college,
        company: user.company,
        designation: user.designation,
        userType: user.userType,
        domain: user.domain,
        skills: user.skills,
        degree: user.degree,
        specialization: user.specialization,
        courseStartYear: user.courseStartYear,
        graduationYear: user.graduationYear,
        pronouns: user.pronouns,
        hobbies: user.hobbies,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        twitterUrl: user.twitterUrl,
        instagramUrl: user.instagramUrl,
        facebookUrl: user.facebookUrl,
        websiteUrl: user.websiteUrl,
        createdAt: user.createdAt,
        postCount,
    };
}

/**
 * Get posts by a specific user ID.
 */
export async function getUserPosts(userId: string) {
    let currentUserId: string | null = null;
    try {
        const stackUser = await stackServerApp.getUser();
        if (stackUser) {
            const dbUser = await getUserByStackAuthId(stackUser.id);
            currentUserId = dbUser?.id ?? null;
        }
    } catch { /* not logged in */ }

    const posts = await prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: {
                    id: true,
                    displayName: true,
                    profileImageUrl: true,
                    email: true,
                    username: true,
                },
            },
            _count: { select: { comments: true, likes: true, reposts: true } },
            ...(currentUserId ? {
                likes: {
                    where: { userId: currentUserId },
                    select: { id: true },
                    take: 1,
                },
                reposts: {
                    where: { userId: currentUserId },
                    select: { id: true },
                    take: 1,
                },
            } : {}),
        },
    });

    return posts.map((post: any) => ({
        ...post,
        isLiked: (post.likes?.length ?? 0) > 0,
        isReposted: (post.reposts?.length ?? 0) > 0,
        likes: undefined,
        reposts: undefined,
        repostedBy: null,
    }));
}
