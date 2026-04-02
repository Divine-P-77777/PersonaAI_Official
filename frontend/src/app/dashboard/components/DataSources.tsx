import { useState } from 'react';
import { FileText, Image as ImageIcon, Type, Link as LinkIcon, Video, Upload, X, Plus } from 'lucide-react';
import { BotFormData } from './CreateBot';
import { FileDropZone } from './FileDropZone';

interface DataSourcesProps {
    formData: BotFormData;
    updateFormData: (data: Partial<BotFormData>) => void;
}

type SourceType = 'pdf' | 'image' | 'long_text' | 'web_link' | 'video_link';

export function DataSources({ formData, updateFormData }: DataSourcesProps) {
    const [activeTab, setActiveTab] = useState<SourceType>('pdf');
    const [textInput, setTextInput] = useState({ title: '', content: '' });
    const [linkInput, setLinkInput] = useState({ title: '', url: '' });

    const sourceTypes = [
        { type: 'pdf' as SourceType, label: 'PDF', icon: FileText, color: 'from-red-400 to-red-500' },
        { type: 'image' as SourceType, label: 'Images', icon: ImageIcon, color: 'from-blue-400 to-blue-500' },
        { type: 'long_text' as SourceType, label: 'Text', icon: Type, color: 'from-green-400 to-green-500' },
        { type: 'web_link' as SourceType, label: 'Web Links', icon: LinkIcon, color: 'from-purple-400 to-purple-500' },
        { type: 'video_link' as SourceType, label: 'Videos', icon: Video, color: 'from-pink-400 to-pink-500' }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
        const files = e.target.files;
        if (files) {
            const newSources = Array.from(files).map(file => ({
                type,
                title: file.name,
                file
            }));
            updateFormData({ dataSources: [...formData.dataSources, ...newSources] });
        }
    };

    const handleMagicFilesAdded = (newFiles: Array<{ type: 'pdf' | 'image'; title: string; file: File }>) => {
        updateFormData({ dataSources: [...formData.dataSources, ...newFiles] });
    };

    const addTextSource = () => {
        if (textInput.title && textInput.content) {
            updateFormData({
                dataSources: [
                    ...formData.dataSources,
                    {
                        type: 'long_text',
                        title: textInput.title,
                        content: textInput.content
                    }
                ]
            });
            setTextInput({ title: '', content: '' });
        }
    };

    const addLinkSource = (type: 'web_link' | 'video_link') => {
        if (linkInput.title && linkInput.url) {
            updateFormData({
                dataSources: [
                    ...formData.dataSources,
                    {
                        type,
                        title: linkInput.title,
                        url: linkInput.url
                    }
                ]
            });
            setLinkInput({ title: '', url: '' });
        }
    };

    const removeSource = (index: number) => {
        updateFormData({
            dataSources: formData.dataSources.filter((_, i) => i !== index)
        });
    };

    const getSourcesByType = (type: SourceType) => {
        return formData.dataSources.filter(source => source.type === type);
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl text-gray-900 mb-2 font-black tracking-tight">Upload your knowledge</h2>
                <p className="text-gray-600 font-medium">Add documents, links, and content that represent your expertise</p>
            </div>

            {/* Magic Drop Zone */}
            <FileDropZone onFilesAdded={handleMagicFilesAdded} className="mb-10" />

            <div className="relative flex items-center justify-center my-10">
                <div className="absolute inset-x-0 h-px bg-gray-100" />
                <span className="relative bg-white px-4 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Or add specific types</span>
            </div>

            {/* Source Type Tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
                {sourceTypes.map((source) => {
                    const Icon = source.icon;
                    const isActive = activeTab === source.type;
                    const count = getSourcesByType(source.type).length;

                    return (
                        <button
                            key={source.type}
                            type="button"
                            onClick={() => setActiveTab(source.type)}
                            className={`relative px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive
                                ? 'bg-gradient-to-r ' + source.color + ' text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {source.label}
                            {count > 0 && (
                                <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs ${isActive ? 'bg-white text-gray-900' : 'bg-orange-500 text-white'
                                    }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Upload Areas */}
            <div className="min-h-[400px]">
                {/* PDF Upload */}
                {activeTab === 'pdf' && (
                    <div className="space-y-4">
                        <label className="block">
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-700 mb-2">Click to upload PDF files</p>
                                <p className="text-sm text-gray-500">
                                    Resume, research papers, articles, or any PDF documents
                                </p>
                            </div>
                            <input
                                type="file"
                                accept=".pdf"
                                multiple
                                onChange={(e) => handleFileUpload(e, 'pdf')}
                                className="hidden"
                            />
                        </label>

                        {getSourcesByType('pdf').length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm text-gray-700">Uploaded PDFs ({getSourcesByType('pdf').length})</h4>
                                {getSourcesByType('pdf').map((source, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-red-500" />
                                            <span className="text-gray-900">{source.title}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSource(formData.dataSources.findIndex(s => s === source))}
                                            className="p-2 -mr-2 sm:mr-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Image Upload */}
                {activeTab === 'image' && (
                    <div className="space-y-4">
                        <label className="block">
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer">
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-700 mb-2">Click to upload images</p>
                                <p className="text-sm text-gray-500">
                                    Certificates, screenshots, diagrams, or any images with text
                                </p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileUpload(e, 'image')}
                                className="hidden"
                            />
                        </label>

                        {getSourcesByType('image').length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm text-gray-700">Uploaded Images ({getSourcesByType('image').length})</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {getSourcesByType('image').map((source, index) => (
                                        <div
                                            key={index}
                                            className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <button
                                                type="button"
                                                onClick={() => removeSource(formData.dataSources.findIndex(s => s === source))}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-2 left-2 right-2 text-white text-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity truncate drop-shadow-md bg-black/40 px-2 py-1 rounded">
                                                {source.title}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Text Input */}
                {activeTab === 'long_text' && (
                    <div className="space-y-4">
                        <div className="border-2 border-gray-300 rounded-2xl p-6">
                            <input
                                type="text"
                                value={textInput.title}
                                onChange={(e) => setTextInput({ ...textInput, title: e.target.value })}
                                placeholder="Title (e.g., My Research Summary)"
                                className="w-full px-4 py-3 mb-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                            />
                            <textarea
                                value={textInput.content}
                                onChange={(e) => setTextInput({ ...textInput, content: e.target.value })}
                                placeholder="Paste or type your content here..."
                                rows={10}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-none text-gray-900 placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={addTextSource}
                                className="mt-4 w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Text Block
                            </button>
                        </div>

                        {getSourcesByType('long_text').length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm text-gray-700">Text Blocks ({getSourcesByType('long_text').length})</h4>
                                {getSourcesByType('long_text').map((source, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Type className="w-5 h-5 text-green-500" />
                                                <span className="text-gray-900">{source.title}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{source.content}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSource(formData.dataSources.findIndex(s => s === source))}
                                            className="p-2 -mr-2 sm:mr-0 ml-2 sm:ml-4 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Web Links */}
                {activeTab === 'web_link' && (
                    <div className="space-y-4">
                        <div className="border-2 border-gray-300 rounded-2xl p-6">
                            <input
                                type="text"
                                value={linkInput.title}
                                onChange={(e) => setLinkInput({ ...linkInput, title: e.target.value })}
                                placeholder="Title (e.g., My Portfolio Website)"
                                className="w-full px-4 py-3 mb-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                            />
                            <input
                                type="url"
                                value={linkInput.url}
                                onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
                                placeholder="https://example.com"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => addLinkSource('web_link')}
                                className="mt-4 w-full py-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Web Link
                            </button>
                        </div>

                        {getSourcesByType('web_link').length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm text-gray-700">Web Links ({getSourcesByType('web_link').length})</h4>
                                {getSourcesByType('web_link').map((source, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <LinkIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-gray-900">{source.title}</div>
                                                <div className="text-sm text-gray-500 truncate">{source.url}</div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSource(formData.dataSources.findIndex(s => s === source))}
                                            className="p-2 -mr-2 sm:mr-0 ml-2 sm:ml-4 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Video Links */}
                {activeTab === 'video_link' && (
                    <div className="space-y-4">
                        <div className="border-2 border-gray-300 rounded-2xl p-6">
                            <input
                                type="text"
                                value={linkInput.title}
                                onChange={(e) => setLinkInput({ ...linkInput, title: e.target.value })}
                                placeholder="Title (e.g., My Tech Talk at Conference)"
                                className="w-full px-4 py-3 mb-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                            />
                            <input
                                type="url"
                                value={linkInput.url}
                                onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
                                placeholder="YouTube or video URL"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => addLinkSource('video_link')}
                                className="mt-4 w-full py-3 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Video Link
                            </button>
                        </div>

                        {getSourcesByType('video_link').length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm text-gray-700">Video Links ({getSourcesByType('video_link').length})</h4>
                                {getSourcesByType('video_link').map((source, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Video className="w-5 h-5 text-pink-500 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-gray-900">{source.title}</div>
                                                <div className="text-sm text-gray-500 truncate">{source.url}</div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSource(formData.dataSources.findIndex(s => s === source))}
                                            className="p-2 -mr-2 sm:mr-0 ml-2 sm:ml-4 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-[32px] p-8 border border-orange-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <Upload size={18} />
                    </div>
                    Knowledge Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                    {sourceTypes.map((source) => {
                        const count = getSourcesByType(source.type).length;
                        return (
                            <div key={source.type} className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white">
                                <div className="text-2xl font-black text-gray-900 leading-none mb-1">{count}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{source.label}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-6 pt-6 border-t border-orange-100 flex justify-center">
                   <div className="px-6 py-2 bg-orange-600 text-white rounded-full text-xs font-black uppercase tracking-widest">
                       Total: {formData.dataSources.length} items
                   </div>
                </div>
            </div>
        </div>
    );
}
