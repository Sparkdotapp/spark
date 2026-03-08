'use server';

import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';
import { syncUserWithDatabase } from '@/lib/user-sync';

// ============================================
// HELPERS
// ============================================
async function getAuthenticatedUser() {
    const stackUser = await stackServerApp.getUser();
    if (!stackUser) throw new Error('Not authenticated');

    const dbUser = await syncUserWithDatabase({
        id: stackUser.id,
        primaryEmail: stackUser.primaryEmail,
        displayName: stackUser.displayName,
        profileImageUrl: stackUser.profileImageUrl,
    });

    return dbUser;
}

// ============================================
// POST CRUD
// ============================================
export async function createPost(data: { content?: string; imageUrl?: string }) {
    try {
        const user = await getAuthenticatedUser();

        if (!data.content?.trim() && !data.imageUrl) {
            return { success: false, error: 'Post must have text or an image' };
        }

        const post = await prisma.post.create({
            data: {
                content: data.content?.trim() || null,
                imageUrl: data.imageUrl || null,
                authorId: user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImageUrl: true,
                        email: true,
                    },
                },
                _count: { select: { comments: true, likes: true, reposts: true } },
            },
        });

        return { success: true, post };
    } catch (error) {
        console.error('Failed to create post:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updatePost(
    postId: string,
    data: { content?: string; imageUrl?: string | null }
) {
    try {
        const user = await getAuthenticatedUser();

        const existing = await prisma.post.findUnique({ where: { id: postId } });
        if (!existing) return { success: false, error: 'Post not found' };
        if (existing.authorId !== user.id) return { success: false, error: 'Not authorized' };

        const newContent = data.content?.trim() || null;
        const newImageUrl = data.imageUrl === undefined ? existing.imageUrl : data.imageUrl;

        if (!newContent && !newImageUrl) {
            return { success: false, error: 'Post must have text or an image' };
        }

        const post = await prisma.post.update({
            where: { id: postId },
            data: {
                content: newContent,
                imageUrl: newImageUrl,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImageUrl: true,
                        email: true,
                    },
                },
                _count: { select: { comments: true, likes: true, reposts: true } },
            },
        });

        return { success: true, post };
    } catch (error) {
        console.error('Failed to update post:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deletePost(postId: string) {
    try {
        const user = await getAuthenticatedUser();

        const existing = await prisma.post.findUnique({ where: { id: postId } });
        if (!existing) return { success: false, error: 'Post not found' };
        if (existing.authorId !== user.id) return { success: false, error: 'Not authorized' };

        await prisma.post.delete({ where: { id: postId } });

        return { success: true };
    } catch (error) {
        console.error('Failed to delete post:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getPosts(cursor?: string, limit: number = 20) {
    try {
        // Try to get current user for like/repost status
        let currentUserId: string | null = null;
        try {
            const user = await getAuthenticatedUser();
            currentUserId = user.id;
        } catch { /* not logged in, that's ok */ }

        const userInclude = {
            author: {
                select: {
                    id: true,
                    displayName: true,
                    profileImageUrl: true,
                    email: true,
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
        };

        // Parse composite cursor: "post:id" or "repost:id"
        let postCursor: string | undefined;
        let repostCursor: string | undefined;
        if (cursor) {
            const [type, id] = cursor.split(':');
            if (type === 'repost') repostCursor = id;
            else postCursor = id;
        }

        // Fetch original posts
        const posts = await prisma.post.findMany({
            take: limit + 1,
            ...(postCursor ? { cursor: { id: postCursor }, skip: 1 } : {}),
            orderBy: { createdAt: 'desc' },
            include: userInclude,
        });

        // Fetch reposts (with full original post data)
        const reposts = await prisma.repost.findMany({
            take: limit + 1,
            ...(repostCursor ? { cursor: { id: repostCursor }, skip: 1 } : {}),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImageUrl: true,
                        email: true,
                    },
                },
                post: {
                    include: userInclude,
                },
            },
        });

        // Build unified feed items
        type FeedItem = {
            feedId: string;
            feedTimestamp: Date;
            post: any;
            repostedBy?: {
                id: string;
                displayName: string | null;
                profileImageUrl: string | null;
                email: string;
                repostId: string;
            };
        };

        const feedItems: FeedItem[] = [];

        // Add original posts
        for (const post of posts) {
            feedItems.push({
                feedId: `post:${post.id}`,
                feedTimestamp: new Date(post.createdAt),
                post,
            });
        }

        // Add reposts (skip if the original post is already in the feed as an original)
        const originalPostIds = new Set(posts.map(p => p.id));
        for (const repost of reposts) {
            feedItems.push({
                feedId: `repost:${repost.id}`,
                feedTimestamp: new Date(repost.createdAt),
                post: repost.post,
                repostedBy: {
                    id: repost.user.id,
                    displayName: repost.user.displayName,
                    profileImageUrl: repost.user.profileImageUrl,
                    email: repost.user.email,
                    repostId: repost.id,
                },
            });
        }

        // Sort by timestamp desc
        feedItems.sort((a, b) => b.feedTimestamp.getTime() - a.feedTimestamp.getTime());

        // Paginate
        const hasMore = feedItems.length > limit;
        const resultItems = feedItems.slice(0, limit);
        const lastItem = resultItems[resultItems.length - 1];
        const nextCursorValue = hasMore && lastItem ? lastItem.feedId : null;

        // Transform to add isLiked/isReposted fields
        const transformedItems = resultItems.map((item) => ({
            ...item.post,
            feedId: item.feedId,
            isLiked: (item.post.likes?.length ?? 0) > 0,
            isReposted: (item.post.reposts?.length ?? 0) > 0,
            likes: undefined,
            reposts: undefined,
            repostedBy: item.repostedBy || null,
        }));

        return { success: true, posts: transformedItems, nextCursor: nextCursorValue };
    } catch (error) {
        console.error('Failed to get posts:', error);
        return { success: false, posts: [], nextCursor: null, error: (error as Error).message };
    }
}

export async function getPostComments(postId: string) {
    try {
        // Try to get current user for like status
        let currentUserId: string | null = null;
        try {
            const user = await getAuthenticatedUser();
            currentUserId = user.id;
        } catch { /* not logged in */ }

        const comments = await prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: 'asc' },
            include: {
                author: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImageUrl: true,
                        email: true,
                    },
                },
                _count: { select: { likes: true } },
                ...(currentUserId ? {
                    likes: {
                        where: { userId: currentUserId },
                        select: { id: true },
                        take: 1,
                    },
                } : {}),
            },
        });

        const commentsWithLikeStatus = comments.map((comment: any) => ({
            ...comment,
            isLiked: (comment.likes?.length ?? 0) > 0,
            likes: undefined,
        }));

        return { success: true, comments: commentsWithLikeStatus };
    } catch (error) {
        console.error('Failed to get comments:', error);
        return { success: false, comments: [], error: (error as Error).message };
    }
}

// ============================================
// COMMENT CRUD
// ============================================
export async function createComment(postId: string, content: string) {
    try {
        const user = await getAuthenticatedUser();

        if (!content.trim()) {
            return { success: false, error: 'Comment cannot be empty' };
        }

        // Verify post exists
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return { success: false, error: 'Post not found' };

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                postId,
                authorId: user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImageUrl: true,
                        email: true,
                    },
                },
            },
        });

        return { success: true, comment };
    } catch (error) {
        console.error('Failed to create comment:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateComment(commentId: string, content: string) {
    try {
        const user = await getAuthenticatedUser();

        if (!content.trim()) {
            return { success: false, error: 'Comment cannot be empty' };
        }

        const existing = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!existing) return { success: false, error: 'Comment not found' };
        if (existing.authorId !== user.id) return { success: false, error: 'Not authorized' };

        const comment = await prisma.comment.update({
            where: { id: commentId },
            data: { content: content.trim() },
            include: {
                author: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImageUrl: true,
                        email: true,
                    },
                },
            },
        });

        return { success: true, comment };
    } catch (error) {
        console.error('Failed to update comment:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteComment(commentId: string) {
    try {
        const user = await getAuthenticatedUser();

        const existing = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!existing) return { success: false, error: 'Comment not found' };
        if (existing.authorId !== user.id) return { success: false, error: 'Not authorized' };

        await prisma.comment.delete({ where: { id: commentId } });

        return { success: true };
    } catch (error) {
        console.error('Failed to delete comment:', error);
        return { success: false, error: (error as Error).message };
    }
}

// ============================================
// LIKE TOGGLE
// ============================================
export async function togglePostLike(postId: string) {
    try {
        const user = await getAuthenticatedUser();

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return { success: false, error: 'Post not found' };

        // Check if already liked
        const existingLike = await prisma.postLike.findUnique({
            where: { postId_userId: { postId, userId: user.id } },
        });

        if (existingLike) {
            // Unlike
            await prisma.postLike.delete({ where: { id: existingLike.id } });
            const count = await prisma.postLike.count({ where: { postId } });
            return { success: true, liked: false, likeCount: count };
        } else {
            // Like
            await prisma.postLike.create({
                data: { postId, userId: user.id },
            });
            const count = await prisma.postLike.count({ where: { postId } });
            return { success: true, liked: true, likeCount: count };
        }
    } catch (error) {
        console.error('Failed to toggle post like:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function toggleCommentLike(commentId: string) {
    try {
        const user = await getAuthenticatedUser();

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) return { success: false, error: 'Comment not found' };

        const existingLike = await prisma.commentLike.findUnique({
            where: { commentId_userId: { commentId, userId: user.id } },
        });

        if (existingLike) {
            await prisma.commentLike.delete({ where: { id: existingLike.id } });
            const count = await prisma.commentLike.count({ where: { commentId } });
            return { success: true, liked: false, likeCount: count };
        } else {
            await prisma.commentLike.create({
                data: { commentId, userId: user.id },
            });
            const count = await prisma.commentLike.count({ where: { commentId } });
            return { success: true, liked: true, likeCount: count };
        }
    } catch (error) {
        console.error('Failed to toggle comment like:', error);
        return { success: false, error: (error as Error).message };
    }
}

// ============================================
// REPOST TOGGLE
// ============================================
export async function toggleRepost(postId: string) {
    try {
        const user = await getAuthenticatedUser();

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return { success: false, error: 'Post not found' };

        // Can't repost your own post
        if (post.authorId === user.id) {
            return { success: false, error: 'You cannot repost your own post' };
        }

        const existingRepost = await prisma.repost.findUnique({
            where: { postId_userId: { postId, userId: user.id } },
        });

        if (existingRepost) {
            await prisma.repost.delete({ where: { id: existingRepost.id } });
            const count = await prisma.repost.count({ where: { postId } });
            return { success: true, reposted: false, repostCount: count };
        } else {
            await prisma.repost.create({
                data: { postId, userId: user.id },
            });
            const count = await prisma.repost.count({ where: { postId } });
            return { success: true, reposted: true, repostCount: count };
        }
    } catch (error) {
        console.error('Failed to toggle repost:', error);
        return { success: false, error: (error as Error).message };
    }
}

// ============================================
// AUTH HELPER (for client)
// ============================================
export async function getCurrentUser() {
    try {
        const user = await getAuthenticatedUser();
        return {
            success: true,
            user: {
                id: user.id,
                displayName: user.displayName,
                profileImageUrl: user.profileImageUrl,
                email: user.email,
            },
        };
    } catch {
        return { success: false, user: null };
    }
}
