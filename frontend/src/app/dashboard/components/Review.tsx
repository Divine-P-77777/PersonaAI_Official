import { Check, FileText, Image as ImageIcon, Type, Link as LinkIcon, Video, Briefcase, GraduationCap, Globe } from 'lucide-react';
import { BotFormData } from './CreateBot';

interface ReviewProps {
    formData: BotFormData;
}

export function Review({ formData }: ReviewProps) {
    const getSourceIcon = (type: string) => {
        switch (type) {
            case 'pdf': return FileText;
            case 'image': return ImageIcon;
            case 'long_text': return Type;
            case 'web_link': return LinkIcon;
            case 'video_link': return Video;
            default: return FileText;
        }
    };

    const getSourceColor = (type: string) => {
        switch (type) {
            case 'pdf': return 'text-red-500';
            case 'image': return 'text-blue-500';
            case 'long_text': return 'text-green-500';
            case 'web_link': return 'text-purple-500';
            case 'video_link': return 'text-pink-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl text-gray-900 mb-2">Review your bot</h2>
                <p className="text-gray-600">Make sure everything looks good before creating</p>
            </div>

            {/* Basic Info Section */}
            <div className="border-2 border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm">
                        1
                    </div>
                    Basic Information
                </h3>
                <div className="flex items-start gap-6">
                    {formData.avatarUrl && (
                        <img
                            src={formData.avatarUrl}
                            alt="Bot avatar"
                            className="w-20 h-20 rounded-full border-4 border-orange-100"
                        />
                    )}
                    <div className="flex-1">
                        <div className="text-2xl text-gray-900 mb-2">{formData.botName || 'No name provided'}</div>
                        <p className="text-gray-600">{formData.botDescription || 'No description provided'}</p>
                    </div>
                </div>
            </div>

            {/* Persona Section */}
            <div className="border-2 border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm">
                        2
                    </div>
                    Persona Configuration
                </h3>

                {/* Greeting */}
                <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-2">Greeting Message</div>
                    <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-xl border border-orange-100">
                        <p className="text-gray-800 italic">"{formData.greeting || 'No greeting provided'}"</p>
                    </div>
                </div>

                {/* Tone */}
                <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-2">Conversation Tone</div>
                    <span className="inline-block px-4 py-2 bg-gray-100 text-gray-800 rounded-full capitalize">
                        {formData.tone}
                    </span>
                </div>

                {/* Expertise */}
                {formData.expertise.length > 0 && (
                    <div className="mb-6">
                        <div className="text-sm text-gray-600 mb-2">Areas of Expertise</div>
                        <div className="flex flex-wrap gap-2">
                            {formData.expertise.map((exp, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gradient-to-r from-orange-100 to-pink-100 text-gray-800 rounded-full text-sm"
                                >
                                    {exp}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Experience */}
                {formData.experience.length > 0 && (
                    <div className="mb-6">
                        <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Work Experience
                        </div>
                        <div className="space-y-3">
                            {formData.experience.map((exp, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="text-gray-900">{exp.title}</div>
                                        <div className="text-sm text-gray-600">{exp.company} • {exp.years} years</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {formData.education.length > 0 && (
                    <div className="mb-6">
                        <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Education
                        </div>
                        <div className="space-y-3">
                            {formData.education.map((edu, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                        🎓
                                    </div>
                                    <div>
                                        <div className="text-gray-900">{edu.degree}</div>
                                        <div className="text-sm text-gray-600">{edu.institute} • {edu.year}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Links */}
                {(formData.links.linkedin || formData.links.github || formData.links.portfolio) && (
                    <div>
                        <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Professional Links
                        </div>
                        <div className="space-y-2">
                            {formData.links.linkedin && (
                                <a
                                    href={formData.links.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    LinkedIn Profile
                                </a>
                            )}
                            {formData.links.github && (
                                <a
                                    href={formData.links.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    GitHub Profile
                                </a>
                            )}
                            {formData.links.portfolio && (
                                <a
                                    href={formData.links.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    Portfolio Website
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Data Sources Section */}
            <div className="border-2 border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm">
                        3
                    </div>
                    Data Sources ({formData.dataSources.length})
                </h3>

                {formData.dataSources.length > 0 ? (
                    <div className="space-y-2">
                        {formData.dataSources.map((source, index) => {
                            const Icon = getSourceIcon(source.type);
                            const colorClass = getSourceColor(source.type);

                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <Icon className={`w-5 h-5 ${colorClass} flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-gray-900 truncate">{source.title}</div>
                                        <div className="text-xs text-gray-500 capitalize">{source.type.replace('_', ' ')}</div>
                                    </div>
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No data sources uploaded
                    </div>
                )}
            </div>

            {/* Success Message */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">🎉</span>
                    You're all set!
                </h3>
                <p className="text-gray-700 mb-4">
                    Your AI persona will be created with all the information you've provided.
                    Students will be able to chat with your bot and learn from your expertise.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Processing typically takes 2-5 minutes
                </div>
            </div>
        </div>
    );
}
