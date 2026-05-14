'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Repeat2, MoreHorizontal, Pencil, Trash2, Loader2, Send, Quote, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getPostComments, createComment, togglePostLike, toggleRepost } from '@/app/actions/social-actions';
import { toast } from 'sonner';
import Link from 'next/link';
import CommentItem from './CommentItem';

interface Author {
    id: string;
    displayName: string | null;
    profileImageUrl: string | null;
    email: string;
    username?: string | null;
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

interface PostCardProps {
    post: {
        id: string;
        content: string | null;
        imageUrl: string | null;
        author: Author;
        _count: { comments: number; likes: number; reposts: number };
        isLiked?: boolean;
        isReposted?: boolean;
        repostedBy?: {
            id: string;
            displayName: string | null;
            profileImageUrl: string | null;
            email: string;
            username?: string | null;
            repostId: string;
            quoteContent?: string | null;
        } | null;
        createdAt: string | Date;
        updatedAt: string | Date;
    };
    currentUserId: string | null;
    onEdit: (postId: string) => void;
    onDelete: (postId: string) => void;
    index: number;
}

export default function PostCard({ post, currentUserId, onEdit, onDelete, index }: PostCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [commentCount, setCommentCount] = useState(post._count.comments);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [liked, setLiked] = useState(post.isLiked ?? false);
    const [likeCount, setLikeCount] = useState(post._count.likes ?? 0);
    const [likingInProgress, setLikingInProgress] = useState(false);
    const [reposted, setReposted] = useState(post.isReposted ?? false);
    const [repostCount, setRepostCount] = useState(post._count.reposts ?? 0);
    const [repostInProgress, setRepostInProgress] = useState(false);
    const [showRepostMenu, setShowRepostMenu] = useState(false);
    const [showQuoteInput, setShowQuoteInput] = useState(false);
    const [quoteText, setQuoteText] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);
    const repostMenuRef = useRef<HTMLDivElement>(null);

    const isAuthor = currentUserId === post.author.id;
    const initials = (post.author.displayName || post.author.email || 'U')[0].toUpperCase();
    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    const isEdited = new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 1000;

    const hasQuote = post.repostedBy?.quoteContent;
    const isSimpleRepost = post.repostedBy && !hasQuote;

    // Close menu on click outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
            if (repostMenuRef.current && !repostMenuRef.current.contains(e.target as Node)) {
                setShowRepostMenu(false);
            }
        }
        if (showMenu || showRepostMenu) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showMenu, showRepostMenu]);

    const handleLike = async () => {
        if (!currentUserId) {
            toast.error('Please sign in to like posts');
            return;
        }
        if (likingInProgress) return;

        setLiked(!liked);
        setLikeCount((c) => (liked ? c - 1 : c + 1));
        setLikingInProgress(true);

        try {
            const result = await togglePostLike(post.id);
            if (result.success) {
                setLiked(result.liked!);
                setLikeCount(result.likeCount!);
            } else {
                setLiked(liked);
                setLikeCount(likeCount);
                toast.error(result.error || 'Failed to like post');
            }
        } catch {
            setLiked(liked);
            setLikeCount(likeCount);
            toast.error('Something went wrong');
        } finally {
            setLikingInProgress(false);
        }
    };

    const handleSimpleRepost = async () => {
        if (!currentUserId) {
            toast.error('Please sign in to repost');
            return;
        }
        if (isAuthor) {
            toast.error("You can't repost your own post");
            return;
        }
        if (repostInProgress) return;

        setShowRepostMenu(false);
        setReposted(!reposted);
        setRepostCount((c) => (reposted ? c - 1 : c + 1));
        setRepostInProgress(true);

        try {
            const result = await toggleRepost(post.id);
            if (result.success) {
                setReposted(result.reposted!);
                setRepostCount(result.repostCount!);
                if (result.reposted) {
                    toast.success('Reposted!');
                } else {
                    toast.success('Repost removed');
                }
            } else {
                setReposted(reposted);
                setRepostCount(repostCount);
                toast.error(result.error || 'Failed to repost');
            }
        } catch {
            setReposted(reposted);
            setRepostCount(repostCount);
            toast.error('Something went wrong');
        } finally {
            setRepostInProgress(false);
        }
    };

    const handleQuoteRepost = async () => {
        if (!currentUserId) {
            toast.error('Please sign in to repost');
            return;
        }
        if (isAuthor) {
            toast.error("You can't repost your own post");
            return;
        }
        if (repostInProgress) return;
        if (!quoteText.trim()) {
            toast.error('Please add a quote');
            return;
        }

        setRepostInProgress(true);
        try {
            const result = await toggleRepost(post.id, quoteText.trim());
            if (result.success) {
                setReposted(result.reposted!);
                setRepostCount(result.repostCount!);
                setShowQuoteInput(false);
                setQuoteText('');
                toast.success('Quote reposted!');
            } else {
                toast.error(result.error || 'Failed to quote repost');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setRepostInProgress(false);
        }
    };

    const handleRepostButtonClick = () => {
        if (!currentUserId) {
            toast.error('Please sign in to repost');
            return;
        }
        if (isAuthor) {
            toast.error("You can't repost your own post");
            return;
        }
        // If already reposted, just undo
        if (reposted) {
            handleSimpleRepost();
            return;
        }
        // Show menu with repost/quote options
        setShowRepostMenu(!showRepostMenu);
    };

    const loadComments = async () => {
        setLoadingComments(true);
        try {
            const result = await getPostComments(post.id);
            if (result.success) {
                setComments(result.comments as CommentData[]);
            }
        } catch {
            toast.error('Failed to load comments');
        } finally {
            setLoadingComments(false);
        }
    };

    const toggleComments = () => {
        if (!showComments) {
            loadComments();
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        if (!currentUserId) {
            toast.error('Please sign in to comment');
            return;
        }

        setSubmittingComment(true);
        try {
            const result = await createComment(post.id, newComment.trim());
            if (result.success && result.comment) {
                setComments((prev) => [...prev, result.comment as CommentData]);
                setCommentCount((c) => c + 1);
                setNewComment('');
            } else {
                toast.error(result.error || 'Failed to add comment');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleCommentDeleted = (commentId: string) => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setCommentCount((c) => c - 1);
    };

    const handleCommentUpdated = (updatedComment: CommentData) => {
        setComments((prev) =>
            prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
        );
    };

    // Helper to get profile link for a user
    const getProfileLink = (user: { username?: string | null; id: string }) => {
        return user.username ? `/${user.username}` : '#';
    };

    // ─── QUOTE REPOST LAYOUT ───
    // If this feed item is a quote repost, show the quoter's info at top + their quote,
    // then the original post embedded inside.
    if (hasQuote && post.repostedBy) {
        const quoter = post.repostedBy;
        const quoterInitials = (quoter.displayName || quoter.email || 'U')[0].toUpperCase();

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgb(26,28,30)] overflow-hidden hover:border-[rgba(255,255,255,0.1)] transition-colors duration-300"
            >
                {/* Quoter Header */}
                <div className="flex items-center justify-between p-5 pb-3">
                    <Link href={getProfileLink(quoter)} className="flex items-center gap-3 group">
                        {quoter.profileImageUrl ? (
                            <img src={quoter.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[rgba(218,255,1,0.15)] flex items-center justify-center text-sm font-bold text-[#DAFF01]">
                                {quoterInitials}
                            </div>
                        )}
                        <div>
                            <p className="text-[15px] font-semibold text-white group-hover:text-[#DAFF01] transition-colors">
                                {quoter.displayName || quoter.email}
                            </p>
                            {quoter.username && (
                                <p className="text-xs text-[rgb(100,100,110)]">@{quoter.username}</p>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Quote Content */}
                <div className="px-5 pb-3">
                    <p className="text-[15px] text-[rgb(220,220,225)] leading-relaxed whitespace-pre-wrap">
                        {quoter.quoteContent}
                    </p>
                </div>

                {/* Embedded Original Post */}
                <div className="mx-5 mb-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)] overflow-hidden">
                    <div className="p-4">
                        <Link href={getProfileLink(post.author)} className="flex items-center gap-2.5 mb-2.5 group">
                            {post.author.profileImageUrl ? (
                                <img src={post.author.profileImageUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-[rgba(218,255,1,0.15)] flex items-center justify-center text-xs font-bold text-[#DAFF01]">
                                    {initials}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-white group-hover:text-[#DAFF01] transition-colors">
                                    {post.author.displayName || post.author.email}
                                </span>
                                {post.author.username && (
                                    <span className="text-xs text-[rgb(100,100,110)]">@{post.author.username}</span>
                                )}
                                <span className="text-xs text-[rgb(80,80,90)]">· {timeAgo}</span>
                            </div>
                        </Link>
                        {post.content && (
                            <p className="text-sm text-[rgb(200,200,210)] leading-relaxed whitespace-pre-wrap">
                                {post.content}
                            </p>
                        )}
                        {post.imageUrl && (
                            <div className="mt-2.5 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.04)]">
                                <img src={post.imageUrl} alt="Post image" className="w-full max-h-[300px] object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.04)] flex items-center gap-1">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${liked
                            ? 'text-red-500 bg-[rgba(255,60,60,0.08)]'
                            : 'text-[rgb(130,130,140)] hover:text-red-400 hover:bg-[rgba(255,255,255,0.04)]'
                            }`}
                    >
                        <Heart className={`w-[18px] h-[18px] ${liked ? 'fill-red-500' : ''}`} />
                        {likeCount > 0 && <span>{likeCount}</span>}
                    </button>

                    <button
                        onClick={toggleComments}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${showComments
                            ? 'text-[#DAFF01] bg-[rgba(218,255,1,0.08)]'
                            : 'text-[rgb(130,130,140)] hover:text-[#DAFF01] hover:bg-[rgba(255,255,255,0.04)]'
                            }`}
                    >
                        <MessageCircle className="w-[18px] h-[18px]" />
                        {commentCount > 0 && <span>{commentCount}</span>}
                    </button>

                    <div className="relative" ref={repostMenuRef}>
                        <button
                            onClick={handleRepostButtonClick}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${reposted
                                ? 'text-emerald-400 bg-[rgba(52,211,153,0.08)]'
                                : 'text-[rgb(130,130,140)] hover:text-emerald-400 hover:bg-[rgba(255,255,255,0.04)]'
                                }`}
                        >
                            <Repeat2 className="w-[18px] h-[18px]" />
                            {repostCount > 0 && <span>{repostCount}</span>}
                        </button>
                    </div>
                </div>

                {/* Comments */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="border-t border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.15)]">
                                <div className="px-5 pt-4">
                                    {loadingComments ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="w-5 h-5 text-[#DAFF01] animate-spin" />
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <p className="text-center text-sm text-[rgb(80,80,90)] py-6">No comments yet.</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {comments.map((comment) => (
                                                <CommentItem key={comment.id} comment={comment} currentUserId={currentUserId} onDeleted={handleCommentDeleted} onUpdated={handleCommentUpdated} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {currentUserId && (
                                    <div className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }} placeholder="Write a comment..." className="flex-1 bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[rgb(80,80,90)] focus:outline-none focus:border-[rgba(218,255,1,0.3)] transition-colors" />
                                            <button onClick={handleAddComment} disabled={!newComment.trim() || submittingComment} className="w-9 h-9 rounded-xl bg-[rgba(218,255,1,0.1)] flex items-center justify-center text-[#DAFF01] hover:bg-[rgba(218,255,1,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }

    // ─── STANDARD POST / SIMPLE REPOST LAYOUT ───
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgb(26,28,30)] overflow-hidden hover:border-[rgba(255,255,255,0.1)] transition-colors duration-300"
        >
            {/* Simple Reposted By Header (clickable) */}
            {isSimpleRepost && post.repostedBy && (
                <Link href={getProfileLink(post.repostedBy)} className="flex items-center gap-2 px-5 pt-4 pb-1 group">
                    <Repeat2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium group-hover:underline">
                        {post.repostedBy.id === currentUserId
                            ? 'You reposted'
                            : `${post.repostedBy.displayName || post.repostedBy.email} reposted`}
                    </span>
                </Link>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3">
                <Link href={getProfileLink(post.author)} className="flex items-center gap-3 group">
                    {post.author.profileImageUrl ? (
                        <img
                            src={post.author.profileImageUrl}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[rgba(218,255,1,0.15)] flex items-center justify-center text-sm font-bold text-[#DAFF01]">
                            {initials}
                        </div>
                    )}
                    <div>
                        <p className="text-[15px] font-semibold text-white group-hover:text-[#DAFF01] transition-colors">
                            {post.author.displayName || post.author.email}
                        </p>
                        <p className="text-xs text-[rgb(100,100,110)]">
                            {post.author.username && <span className="mr-1.5">@{post.author.username}</span>}
                            <span>{timeAgo}</span>
                            {isEdited && (
                                <span className="ml-1 text-[rgb(80,80,90)]">• edited</span>
                            )}
                        </p>
                    </div>
                </Link>

                {/* Menu — only show for original author, not on reposts */}
                {isAuthor && !post.repostedBy && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgb(100,100,110)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-1 z-20 bg-[rgb(35,37,40)] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-xl min-w-[140px]"
                                >
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            onEdit(post.id);
                                        }}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[rgb(200,200,210)] hover:bg-[rgba(255,255,255,0.05)] w-full transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            onDelete(post.id);
                                        }}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-[rgba(255,0,0,0.08)] w-full transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Content */}
            {post.content && (
                <div className="px-5 pb-3">
                    <p className="text-[15px] text-[rgb(220,220,225)] leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </p>
                </div>
            )}

            {/* Image */}
            {post.imageUrl && (
                <div className="mx-5 mb-3 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.04)]">
                    <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="w-full max-h-[500px] object-cover"
                    />
                </div>
            )}

            {/* Quote Input (shown when user wants to quote repost) */}
            <AnimatePresence>
                {showQuoteInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="mx-5 mb-3 p-3 rounded-xl bg-[rgba(52,211,153,0.04)] border border-[rgba(52,211,153,0.15)]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                                    <Quote className="w-3 h-3" /> Add your thoughts
                                </span>
                                <button onClick={() => { setShowQuoteInput(false); setQuoteText(''); }} className="text-[rgb(100,100,110)] hover:text-white transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <textarea
                                value={quoteText}
                                onChange={(e) => setQuoteText(e.target.value)}
                                placeholder="What are your thoughts?"
                                rows={2}
                                className="w-full bg-transparent text-sm text-white placeholder:text-[rgb(80,80,90)] resize-none outline-none"
                                autoFocus
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleQuoteRepost}
                                    disabled={!quoteText.trim() || repostInProgress}
                                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {repostInProgress ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Quote Repost'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions Bar */}
            <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.04)] flex items-center gap-1">
                {/* Like */}
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${liked
                        ? 'text-red-500 bg-[rgba(255,60,60,0.08)]'
                        : 'text-[rgb(130,130,140)] hover:text-red-400 hover:bg-[rgba(255,255,255,0.04)]'
                        }`}
                >
                    <motion.div
                        key={liked ? 'liked' : 'not-liked'}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <Heart className={`w-[18px] h-[18px] ${liked ? 'fill-red-500' : ''}`} />
                    </motion.div>
                    {likeCount > 0 && <span>{likeCount}</span>}
                </button>

                {/* Comment */}
                <button
                    onClick={toggleComments}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${showComments
                        ? 'text-[#DAFF01] bg-[rgba(218,255,1,0.08)]'
                        : 'text-[rgb(130,130,140)] hover:text-[#DAFF01] hover:bg-[rgba(255,255,255,0.04)]'
                        }`}
                >
                    <MessageCircle className="w-[18px] h-[18px]" />
                    {commentCount > 0 && <span>{commentCount}</span>}
                </button>

                {/* Repost with dropdown */}
                <div className="relative" ref={repostMenuRef}>
                    <button
                        onClick={handleRepostButtonClick}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${reposted
                            ? 'text-emerald-400 bg-[rgba(52,211,153,0.08)]'
                            : 'text-[rgb(130,130,140)] hover:text-emerald-400 hover:bg-[rgba(255,255,255,0.04)]'
                            }`}
                    >
                        <motion.div
                            key={reposted ? 'reposted' : 'not-reposted'}
                            initial={{ scale: 0.8, rotate: 0 }}
                            animate={{ scale: 1, rotate: reposted ? 360 : 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                        >
                            <Repeat2 className="w-[18px] h-[18px]" />
                        </motion.div>
                        {repostCount > 0 && <span>{repostCount}</span>}
                    </button>

                    {/* Repost dropdown menu */}
                    <AnimatePresence>
                        {showRepostMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 bottom-full mb-1 z-20 bg-[rgb(35,37,40)] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-xl min-w-[160px]"
                            >
                                <button
                                    onClick={handleSimpleRepost}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[rgb(200,200,210)] hover:bg-[rgba(255,255,255,0.05)] w-full transition-colors"
                                >
                                    <Repeat2 className="w-4 h-4 text-emerald-400" /> Repost
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRepostMenu(false);
                                        setShowQuoteInput(true);
                                    }}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[rgb(200,200,210)] hover:bg-[rgba(255,255,255,0.05)] w-full transition-colors"
                                >
                                    <Quote className="w-4 h-4 text-emerald-400" /> Quote
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="border-t border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.15)]">
                            {/* Comments list */}
                            <div className="px-5 pt-4">
                                {loadingComments ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="w-5 h-5 text-[#DAFF01] animate-spin" />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <p className="text-center text-sm text-[rgb(80,80,90)] py-6">
                                        No comments yet. Be the first to comment!
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        {comments.map((comment) => (
                                            <CommentItem
                                                key={comment.id}
                                                comment={comment}
                                                currentUserId={currentUserId}
                                                onDeleted={handleCommentDeleted}
                                                onUpdated={handleCommentUpdated}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add comment */}
                            {currentUserId && (
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAddComment();
                                                }
                                            }}
                                            placeholder="Write a comment..."
                                            className="flex-1 bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[rgb(80,80,90)] focus:outline-none focus:border-[rgba(218,255,1,0.3)] transition-colors"
                                        />
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim() || submittingComment}
                                            className="w-9 h-9 rounded-xl bg-[rgba(218,255,1,0.1)] flex items-center justify-center text-[#DAFF01] hover:bg-[rgba(218,255,1,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {submittingComment ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
