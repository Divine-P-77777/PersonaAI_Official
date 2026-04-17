import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';

// ─── File size limits ─────────────────────────────────────────────────────────
const PDF_MAX_MB   = 50;   // max PDF size in MB
const IMAGE_MAX_MB = 10;   // max image size after compression in MB
const PDF_MAX_BYTES   = PDF_MAX_MB   * 1024 * 1024;
const IMAGE_MAX_BYTES = IMAGE_MAX_MB * 1024 * 1024;

// ─── Compression config (browser-image-compression) ──────────────────────────
// If an image is over IMAGE_MAX_MB we try to compress it down automatically.
const COMPRESSION_OPTIONS = {
  maxSizeMB: IMAGE_MAX_MB,
  maxWidthOrHeight: 4096,
  useWebWorker: true,
  fileType: 'image/webp', // WebP gives the best size/quality ratio
  initialQuality: 0.85,
};

interface FileDropZoneProps {
    onFilesAdded: (sources: Array<{ type: 'pdf' | 'image'; title: string; file: File }>) => void;
    className?: string;
}

export function FileDropZone({ onFilesAdded, className = "" }: FileDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [compressing, setCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showError = (msg: string) => {
        setError(msg);
        setTimeout(() => setError(null), 6000);
    };

    /**
     * Validate and optionally compress a single file.
     * Returns the (possibly compressed) File, or null if it must be rejected.
     */
    const processOneFile = async (
        file: File
    ): Promise<{ type: 'pdf' | 'image'; title: string; file: File } | null> => {
        if (file.type === 'application/pdf') {
            if (file.size > PDF_MAX_BYTES) {
                showError(
                    `"${file.name}" exceeds the ${PDF_MAX_MB} MB PDF limit (${(file.size / 1024 / 1024).toFixed(1)} MB). Please reduce the file size before uploading.`
                );
                return null;
            }
            return { type: 'pdf', title: file.name, file };
        }

        if (file.type.startsWith('image/')) {
            let finalFile = file;

            // If the image is larger than the limit, try to compress it
            if (file.size > IMAGE_MAX_BYTES) {
                try {
                    const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
                    if (compressed.size > IMAGE_MAX_BYTES) {
                        // Compression still couldn't bring it under the limit
                        showError(
                            `"${file.name}" is too large even after compression (${(compressed.size / 1024 / 1024).toFixed(1)} MB). Max is ${IMAGE_MAX_MB} MB.`
                        );
                        return null;
                    }
                    // Rename to reflect compression
                    const ext = compressed.name.endsWith('.webp') ? '' : '.webp';
                    finalFile = new File(
                        [compressed],
                        file.name.replace(/\.[^.]+$/, '') + ext,
                        { type: compressed.type }
                    );
                } catch {
                    showError(`Failed to compress "${file.name}". Try a smaller image.`);
                    return null;
                }
            }

            return { type: 'image', title: finalFile.name, file: finalFile };
        }

        return null; // unsupported type
    };

    const processFiles = async (files: FileList | File[]) => {
        const arr = Array.from(files);
        const ignoredNames: string[] = [];
        const accepted: Array<{ type: 'pdf' | 'image'; title: string; file: File }> = [];

        // Check if any images need compression first so we can show the spinner
        const needsCompression = arr.some(
            f => f.type.startsWith('image/') && f.size > IMAGE_MAX_BYTES
        );
        if (needsCompression) setCompressing(true);

        for (const file of arr) {
            const result = await processOneFile(file);
            if (result) {
                accepted.push(result);
            } else if (
                file.type !== 'application/pdf' &&
                !file.type.startsWith('image/')
            ) {
                // Truly unsupported type (not just a size failure)
                ignoredNames.push(file.name);
            }
        }

        setCompressing(false);

        if (accepted.length > 0) {
            onFilesAdded(accepted);
            setError(null);
        }

        if (ignoredNames.length > 0) {
            showError(
                `Skipped ${ignoredNames.length} unsupported file(s) — only PDF and images are allowed.`
            );
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) processFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) processFiles(files);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`relative ${className}`}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !compressing && fileInputRef.current?.click()}
                className={`
                    group relative overflow-hidden transition-all duration-500 cursor-pointer
                    border-4 border-dashed rounded-[40px] p-12 text-center
                    ${compressing ? 'border-orange-300 bg-orange-50/40 cursor-wait' :
                      isDragging
                        ? 'border-orange-500 bg-orange-50/50 scale-[0.99] shadow-2xl shadow-orange-200'
                        : 'border-orange-100 bg-white hover:border-orange-400 hover:bg-orange-50/20'
                    }
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    multiple
                    accept=".pdf,image/*"
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-6 relative z-10">
                    <div className={`
                        w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500
                        ${compressing
                            ? 'bg-orange-100 text-orange-400'
                            : isDragging
                                ? 'bg-orange-500 text-white rotate-12 scale-110 shadow-xl'
                                : 'bg-orange-50 text-orange-600 group-hover:scale-105 group-hover:bg-orange-100'
                        }
                    `}>
                        {compressing ? (
                            <Loader2 size={40} className="animate-spin" />
                        ) : isDragging ? (
                            <Plus size={48} strokeWidth={2.5} />
                        ) : (
                            <Upload size={40} />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                            {compressing
                                ? 'Compressing images…'
                                : isDragging
                                    ? 'Drop to categorise!'
                                    : 'Magic Drag & Drop'}
                        </h3>
                        <p className="text-gray-500 font-bold text-sm max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                            {compressing
                                ? 'Please wait while we optimise your images'
                                : <>Drop PDFs (up to {PDF_MAX_MB} MB) or Images (up to {IMAGE_MAX_MB} MB) and <span className="text-orange-600">we'll handle the rest</span></>
                            }
                        </p>
                    </div>

                    {/* File type badges */}
                    {!compressing && (
                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex flex-col items-center gap-1 group-hover:translate-y-[-4px] transition-transform">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-500 border border-gray-100">
                                    <FileText size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">PDF ≤{PDF_MAX_MB}MB</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group-hover:translate-y-[-4px] transition-transform delay-75">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500 border border-gray-100">
                                    <ImageIcon size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">IMG ≤{IMAGE_MAX_MB}MB</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Animated Background Icons during Drag */}
                <AnimatePresence>
                    {isDragging && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none overflow-hidden"
                        >
                            <motion.div
                                animate={{ y: [0, -100], x: [0, 50], rotate: [0, 15] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute top-10 left-10 text-orange-100"
                            >
                                <FileText size={60} />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, -80], x: [0, -40], rotate: [0, -20] }}
                                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                                className="absolute bottom-10 right-10 text-pink-100"
                            >
                                <ImageIcon size={80} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Error / Info Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-20 left-0 right-0 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 shadow-xl z-20"
                    >
                        <AlertCircle size={20} className="shrink-0" />
                        <span className="text-sm font-bold flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-full shrink-0">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
