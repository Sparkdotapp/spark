'use server';

import { stackServerApp } from '@/stack/server';
import { syncUserWithDatabase, getUserByStackAuthId, updateUserProfile } from '@/lib/user-sync';

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
    bio?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    websiteUrl?: string;
}) {
    const stackUser = await stackServerApp.getUser();

    if (!stackUser) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const updatedUser = await updateUserProfile(stackUser.id, data);
        return { success: true, user: updatedUser };
    } catch (error) {
        console.error('Failed to update profile:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}
