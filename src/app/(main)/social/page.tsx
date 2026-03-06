'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Loader2, MessageSquare, Zap } from 'lucide-react';
import { getPosts, deletePost, getCurrentUser } from '@/app/actions/social-actions';
import { toast } from 'sonner';
import CreatePostForm from '@/components/social/CreatePostForm';
import PostCard from '@/components/social/PostCard';
import PostEditModal from '@/components/social/PostEditModal';

interface Author {
  id: string;
  displayName: string | null;
  profileImageUrl: string | null;
  email: string;
}

interface PostData {
  id: string;
  content: string | null;
  imageUrl: string | null;
  author: Author;
  _count: { comments: number; likes: number };
  isLiked?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function SocialPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Author | null>(null);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);

  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [loadMoreRef, loadMoreInView] = useInView({ threshold: 0.1 });

  // Load current user
  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res.success && res.user) {
        setCurrentUser(res.user);
      }
    });
  }, []);

  // Initial load
  const loadPosts = useCallback(async (reset = false) => {
    if (reset) setLoading(true);
    try {
      const result = await getPosts(undefined, 20);
      if (result.success) {
        setPosts(result.posts as PostData[]);
        setNextCursor(result.nextCursor);
      }
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

  // Load more on scroll
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getPosts(nextCursor, 20);
      if (result.success) {
        setPosts((prev) => [...prev, ...(result.posts as PostData[])]);
        setNextCursor(result.nextCursor);
      }
    } catch {
      toast.error('Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore]);

  useEffect(() => {
    if (loadMoreInView && nextCursor) {
      loadMore();
    }
  }, [loadMoreInView, nextCursor, loadMore]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const result = await deletePost(postId);
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        toast.success('Post deleted');
      } else {
        toast.error(result.error || 'Failed to delete post');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleEdit = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) setEditingPost(post);
  };

  return (
    <div className="min-h-screen bg-[rgb(17,17,19)]">
      {/* Hero */}
      <section ref={headerRef} className="relative pt-32 pb-8 overflow-hidden">
        <div className="max-w-[680px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
              Social Hub
            </h1>
            <p className="text-[rgb(130,130,140)] text-lg max-w-md mx-auto">
              Share ideas, connect with the community, and stay inspired.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feed */}
      <section className="pb-24">
        <div className="max-w-[680px] mx-auto px-4 space-y-6">
          {/* Create Post */}
          {currentUser && (
            <CreatePostForm
              user={currentUser}
              onPostCreated={() => loadPosts(true)}
            />
          )}

          {/* Posts */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#DAFF01] animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-[rgba(218,255,1,0.08)] flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-[#DAFF01]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
              <p className="text-[rgb(130,130,140)] mb-6">
                Be the first to share something with the community!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id || null}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  index={i}
                />
              ))}

              {/* Load more trigger */}
              {nextCursor && (
                <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                  {loadingMore && (
                    <Loader2 className="w-6 h-6 text-[#DAFF01] animate-spin" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit Modal */}
      {editingPost && (
        <PostEditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdated={() => loadPosts(true)}
        />
      )}
    </div>
  );
}
