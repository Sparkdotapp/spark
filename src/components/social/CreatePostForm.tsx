'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, X, Loader2, Send } from 'lucide-react';
import { createPost } from '@/app/actions/social-actions';
import { toast } from 'sonner';

interface CreatePostFormProps {
    user: {
        id: string;
        displayName: string | null;
        profileImageUrl: string | null;
        email: string;
    };
    onPostCreated: () => void;
}

export default function CreatePostForm({ user, onPostCreated }: CreatePostFormProps) {
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleImageUpload = useCallback(async (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only JPEG, PNG, GIF, and WebP images are allowed');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setImageUrl(data.url);
            toast.success('Image uploaded');
        } catch (err) {
            toast.error((err as Error).message || 'Failed to upload image');
            setImagePreview(null);
            setImageUrl(null);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleImageUpload(file);
        },
        [handleImageUpload]
    );

    const removeImage = () => {
        setImageUrl(null);
        setImagePreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!content.trim() && !imageUrl) {
            toast.error('Add some text or an image to post');
            return;
        }

        setIsPosting(true);
        try {
            const result = await createPost({
                content: content.trim() || undefined,
                imageUrl: imageUrl || undefined,
            });

            if (result.success) {
                setContent('');
                setImageUrl(null);
                setImagePreview(null);
                setIsExpanded(false);
                toast.success('Post created!');
                onPostCreated();
            } else {
                toast.error(result.error || 'Failed to create post');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setIsPosting(false);
        }
    };

    const initials = (user.displayName || user.email || 'U')[0].toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgb(26,28,30)] overflow-hidden"
        >
            <div className="p-5">
                {/* Top row: avatar + input */}
                <div className="flex items-start gap-3">
                    {user.profileImageUrl ? (
                        <img
                            src={user.profileImageUrl}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[rgba(218,255,1,0.15)] flex items-center justify-center text-sm font-bold text-[#DAFF01] flex-shrink-0">
                            {initials}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            placeholder="What's on your mind?"
                            rows={isExpanded ? 3 : 1}
                            className="w-full bg-transparent text-white placeholder:text-[rgb(100,100,110)] resize-none focus:outline-none text-[15px] leading-relaxed"
                        />
                    </div>
                </div>

                {/* Image preview */}
                <AnimatePresence>
                    {imagePreview && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 relative"
                        >
                            <div className="relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)]">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full max-h-[300px] object-cover"
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-[#DAFF01] animate-spin" />
                                    </div>
                                )}
                                <button
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[rgba(0,0,0,0.7)] flex items-center justify-center hover:bg-[rgba(0,0,0,0.9)] transition-colors"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Drag area hint when expanded */}
                <AnimatePresence>
                    {isExpanded && !imagePreview && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="mt-3 border-2 border-dashed border-[rgba(255,255,255,0.06)] rounded-xl p-6 text-center cursor-pointer hover:border-[rgba(218,255,1,0.2)] transition-colors"
                            onClick={() => fileRef.current?.click()}
                        >
                            <ImagePlus className="w-6 h-6 text-[rgb(100,100,110)] mx-auto mb-2" />
                            <p className="text-sm text-[rgb(100,100,110)]">
                                Click or drag & drop an image
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions bar */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="flex items-center justify-between px-5 py-3 border-t border-[rgba(255,255,255,0.06)]">
                            <div className="flex items-center gap-2">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(file);
                                    }}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[rgb(161,161,170)] hover:text-[#DAFF01] hover:bg-[rgba(218,255,1,0.08)] transition-all duration-200"
                                >
                                    <ImagePlus className="w-4 h-4" />
                                    Photo
                                </button>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isPosting || isUploading || (!content.trim() && !imageUrl)}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] transition-all duration-200 hover:bg-[rgb(166,190,21)] hover:shadow-[0_4px_15px_rgba(218,255,1,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                            >
                                {isPosting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                Post
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
