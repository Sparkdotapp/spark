'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MoreHorizontal, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { updateComment, deleteComment, toggleCommentLike } from '@/app/actions/social-actions';
import { toast } from 'sonner';

interface Author {
    id: string;
    displayName: string | null;
    profileImageUrl: string | null;
    email: string;
}

interface CommentData {
    id: string;
    content: string;
    author: Author;
    _count?: { likes: number };
    isLiked?: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}

interface CommentItemProps {
    comment: CommentData;
    currentUserId: string | null;
    onDeleted: (commentId: string) => void;
    onUpdated: (comment: CommentData) => void;
}

export default function CommentItem({
    comment,
    currentUserId,
    onDeleted,
    onUpdated,
}: CommentItemProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [liked, setLiked] = useState(comment.isLiked ?? false);
    const [likeCount, setLikeCount] = useState(comment._count?.likes ?? 0);
    const [likingInProgress, setLikingInProgress] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    const isAuthor = currentUserId === comment.author.id;
    const initials = (comment.author.displayName || comment.author.email || 'U')[0].toUpperCase();
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
    const isEdited =
        new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000;

    // Close menu on click outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        }
        if (showMenu) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showMenu]);

    // Focus edit input
    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isEditing]);

    const handleLike = async () => {
        if (!currentUserId) {
            toast.error('Please sign in to like comments');
            return;
        }
        if (likingInProgress) return;

        // Optimistic update
        setLiked(!liked);
        setLikeCount((c) => (liked ? c - 1 : c + 1));
        setLikingInProgress(true);

        try {
            const result = await toggleCommentLike(comment.id);
            if (result.success) {
                setLiked(result.liked!);
                setLikeCount(result.likeCount!);
            } else {
                setLiked(liked);
                setLikeCount(likeCount);
                toast.error(result.error || 'Failed to like comment');
            }
        } catch {
            setLiked(liked);
            setLikeCount(likeCount);
            toast.error('Something went wrong');
        } finally {
            setLikingInProgress(false);
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updateComment(comment.id, editContent.trim());
            if (result.success && result.comment) {
                onUpdated(result.comment as CommentData);
                setIsEditing(false);
                toast.success('Comment updated');
            } else {
                toast.error(result.error || 'Failed to update comment');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteComment(comment.id);
            if (result.success) {
                onDeleted(comment.id);
                toast.success('Comment deleted');
            } else {
                toast.error(result.error || 'Failed to delete comment');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex gap-3 py-3 group"
        >
            {/* Avatar */}
            {comment.author.profileImageUrl ? (
                <img
                    src={comment.author.profileImageUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-[rgba(218,255,1,0.1)] flex items-center justify-center text-xs font-bold text-[#DAFF01] flex-shrink-0">
                    {initials}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white">
                        {comment.author.displayName || comment.author.email}
                    </span>
                    <span className="text-[11px] text-[rgb(80,80,90)]">
                        {timeAgo}
                        {isEdited && ' • edited'}
                    </span>
                </div>

                {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            ref={editInputRef}
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEdit();
                                if (e.key === 'Escape') {
                                    setIsEditing(false);
                                    setEditContent(comment.content);
                                }
                            }}
                            className="flex-1 bg-[rgb(35,37,40)] border border-[rgba(218,255,1,0.2)] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[rgba(218,255,1,0.4)] transition-colors"
                        />
                        <button
                            onClick={handleEdit}
                            disabled={isSubmitting}
                            className="w-7 h-7 rounded-lg bg-[rgba(218,255,1,0.12)] flex items-center justify-center text-[#DAFF01] hover:bg-[rgba(218,255,1,0.2)] transition-colors"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Check className="w-3.5 h-3.5" />
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditContent(comment.content);
                            }}
                            className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[rgb(130,130,140)] hover:text-white transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-[rgb(200,200,210)] leading-relaxed">{comment.content}</p>
                        {/* Like button for comment */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 mt-1.5 text-xs transition-all duration-200 ${liked
                                    ? 'text-red-500'
                                    : 'text-[rgb(90,90,100)] hover:text-red-400'
                                }`}
                        >
                            <motion.div
                                key={liked ? 'liked' : 'not-liked'}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500' : ''}`} />
                            </motion.div>
                            {likeCount > 0 && <span>{likeCount}</span>}
                        </button>
                    </>
                )}
            </div>

            {/* Menu */}
            {isAuthor && !isEditing && (
                <div className="relative flex-shrink-0" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[rgb(60,60,70)] opacity-0 group-hover:opacity-100 hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 z-20 bg-[rgb(35,37,40)] rounded-lg border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-xl min-w-[120px]"
                            >
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        setIsEditing(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-[rgb(200,200,210)] hover:bg-[rgba(255,255,255,0.05)] w-full transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        handleDelete();
                                    }}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-[rgba(255,0,0,0.08)] w-full transition-colors"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}{' '}
                                    Delete
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}
