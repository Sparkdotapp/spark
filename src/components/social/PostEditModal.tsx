'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImagePlus, Loader2, Save } from 'lucide-react';
import { updatePost } from '@/app/actions/social-actions';
import { toast } from 'sonner';

interface PostEditModalProps {
    post: {
        id: string;
        content: string | null;
        imageUrl: string | null;
    };
    onClose: () => void;
    onUpdated: () => void;
}

export default function PostEditModal({ post, onClose, onUpdated }: PostEditModalProps) {
    const [content, setContent] = useState(post.content || '');
    const [imageUrl, setImageUrl] = useState<string | null>(post.imageUrl);
    const [imagePreview, setImagePreview] = useState<string | null>(post.imageUrl);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

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

        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            setImageUrl(data.url);
            toast.success('Image uploaded');
        } catch (err) {
            toast.error((err as Error).message || 'Failed to upload image');
            setImagePreview(post.imageUrl);
            setImageUrl(post.imageUrl);
        } finally {
            setIsUploading(false);
        }
    }, [post.imageUrl]);

    const removeImage = () => {
        setImageUrl(null);
        setImagePreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSave = async () => {
        if (!content.trim() && !imageUrl) {
            toast.error('Post must have text or an image');
            return;
        }

        setIsSaving(true);
        try {
            const result = await updatePost(post.id, {
                content: content.trim() || undefined,
                imageUrl: imageUrl,
            });

            if (result.success) {
                toast.success('Post updated');
                onUpdated();
                onClose();
            } else {
                toast.error(result.error || 'Failed to update post');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-lg mx-4 bg-[rgb(26,28,30)] rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
                        <h3 className="text-lg font-semibold text-white">Edit Post</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgb(130,130,140)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            placeholder="What's on your mind?"
                            className="w-full bg-[rgb(35,37,40)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-[15px] text-white placeholder:text-[rgb(80,80,90)] focus:outline-none focus:border-[rgba(218,255,1,0.3)] resize-none transition-colors"
                        />

                        {/* Image preview */}
                        {imagePreview ? (
                            <div className="relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)]">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full max-h-[250px] object-cover"
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
                        ) : (
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="w-full border-2 border-dashed border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-center text-sm text-[rgb(100,100,110)] hover:border-[rgba(218,255,1,0.2)] hover:text-[rgb(160,160,170)] transition-colors flex items-center justify-center gap-2"
                            >
                                <ImagePlus className="w-4 h-4" />
                                Add an image
                            </button>
                        )}

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
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[rgba(255,255,255,0.06)]">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium rounded-xl text-[rgb(161,161,170)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isUploading || (!content.trim() && !imageUrl)}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] transition-all duration-200 hover:bg-[rgb(166,190,21)] hover:shadow-[0_4px_15px_rgba(218,255,1,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
