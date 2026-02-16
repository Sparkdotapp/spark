'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { getCurrentDbUser } from '@/app/actions/user-actions';
import type { User } from '@prisma/client';

/**
 * Hook to get the current user's database record.
 * Returns the database user, loading state, and error state.
 */
export function useDbUser() {
    const stackUser = useUser();
    const [dbUser, setDbUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!stackUser) {
            setDbUser(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        getCurrentDbUser()
            .then((user) => {
                setDbUser(user);
                setError(null);
            })
            .catch((err) => {
                setError(err);
                setDbUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [stackUser?.id]);

    return {
        user: dbUser,
        stackUser,
        isLoading,
        error,
        isAuthenticated: !!stackUser,
    };
}
