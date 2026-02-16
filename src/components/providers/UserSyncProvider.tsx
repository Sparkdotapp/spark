'use client';

import { useEffect, Suspense } from 'react';
import { useUser } from '@stackframe/stack';
import { syncCurrentUser } from '@/app/actions/user-actions';

/**
 * Internal component that handles the user sync logic
 */
function UserSyncInner() {
    const user = useUser();

    useEffect(() => {
        if (user) {
            // Sync user with database when they're authenticated
            syncCurrentUser().catch((error) => {
                console.error('Failed to sync user with database:', error);
            });
        }
    }, [user?.id]); // Only re-run when user ID changes

    return null;
}

/**
 * Provider component that syncs the authenticated user with the database.
 * Add this to your layout to automatically sync users on login.
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={null}>
                <UserSyncInner />
            </Suspense>
            {children}
        </>
    );
}
