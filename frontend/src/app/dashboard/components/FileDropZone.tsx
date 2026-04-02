import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Plus, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileDropZoneProps {
    onFilesAdded: (sources: Array<{ type: 'pdf' | 'image'; title: string; file: File }>) => void;
    className?: string;
}

export function FileDropZone({ onFilesAdded, className = "" }: FileDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = (files: FileList | File[]) => {
        const newSources: Array<{ type: 'pdf' | 'image'; title: string; file: File }> = [];
        const ignoredFiles: string[] = [];

        Array.from(files).forEach(file => {
            if (file.type === 'application/pdf') {
                newSources.push({ type: 'pdf', title: file.name, file });
            } else if (file.type.startsWith('image/')) {
                newSources.push({ type: 'image', title: file.name, file });
            } else {
                ignoredFiles.push(file.name);
            }
        });

        if (newSources.length > 0) {
            onFilesAdded(newSources);
            setError(null);
        }

        if (ignoredFiles.length > 0) {
            setError(`Ignored ${ignoredFiles.length} unsupported files (only PDF and Images supported).`);
            setTimeout(() => setError(null), 5000);
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
        if (files && files.length > 0) {
            processFiles(files);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
        // Reset input value to allow the same file to be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`relative ${className}`}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    group relative overflow-hidden transition-all duration-500 cursor-pointer
                    border-4 border-dashed rounded-[40px] p-12 text-center
                    ${isDragging 
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
                        ${isDragging ? 'bg-orange-500 text-white rotate-12 scale-110 shadow-xl' : 'bg-orange-50 text-orange-600 group-hover:scale-105 group-hover:bg-orange-100'}
                    `}>
                        {isDragging ? (
                            <Plus size={48} strokeWidth={2.5} />
                        ) : (
                            <Upload size={40} />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                            {isDragging ? 'Drop to categorise!' : 'Magic Drag & Drop'}
                        </h3>
                        <p className="text-gray-500 font-bold text-sm max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
                            Drop multiple PDFs or Images and <span className="text-orange-600">we'll handle the rest</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex flex-col items-center gap-1 group-hover:translate-y-[-4px] transition-transform">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-500 border border-gray-100">
                                <FileText size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">PDFs</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 group-hover:translate-y-[-4px] transition-transform delay-75">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500 border border-gray-100">
                                <ImageIcon size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Images</span>
                        </div>
                    </div>
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
                                animate={{ 
                                    y: [0, -100], 
                                    x: [0, 50],
                                    rotate: [0, 15] 
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute top-10 left-10 text-orange-100"
                            >
                                <FileText size={60} />
                            </motion.div>
                            <motion.div 
                                animate={{ 
                                    y: [0, -80], 
                                    x: [0, -40],
                                    rotate: [0, -20] 
                                }}
                                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                                className="absolute bottom-10 right-10 text-pink-100"
                            >
                                <ImageIcon size={80} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-16 left-0 right-0 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 shadow-xl z-20"
                    >
                        <AlertCircle size={20} className="shrink-0" />
                        <span className="text-sm font-bold">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-full">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
