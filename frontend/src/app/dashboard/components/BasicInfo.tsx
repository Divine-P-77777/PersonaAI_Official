import { Upload, Image as ImageIcon } from 'lucide-react';
import { BotFormData } from './CreateBot';

interface BasicInfoProps {
    formData: BotFormData;
    updateFormData: (data: Partial<BotFormData>) => void;
}

export function BasicInfo({ formData, updateFormData }: BasicInfoProps) {
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateFormData({ avatarUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl text-gray-900 mb-2">Let's start with the basics</h2>
                <p className="text-gray-600">Tell us about your AI persona</p>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-8">
                <label className="cursor-pointer group">
                    <div className="relative">
                        {formData.avatarUrl ? (
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-100 group-hover:border-orange-300 transition-colors">
                                <img
                                    src={formData.avatarUrl}
                                    alt="Bot avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 border-4 border-orange-100 group-hover:border-orange-300 transition-colors flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-orange-400" />
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                    />
                </label>
                <p className="text-sm text-gray-500 mt-3">Upload a profile picture for your bot</p>
            </div>

            {/* Bot Name */}
            <div>
                <label className="block text-sm text-gray-700 mb-2">
                    Bot Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.botName}
                    onChange={(e) => updateFormData({ botName: e.target.value })}
                    placeholder="e.g., Dr. Sarah Chen"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                    This will be your bot's display name
                </p>
            </div>

            {/* Bot Description */}
            <div>
                <label className="block text-sm text-gray-700 mb-2">
                    Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.botDescription}
                    onChange={(e) => updateFormData({ botDescription: e.target.value })}
                    placeholder="e.g., Computer Science Professor with 15 years of experience in Machine Learning and AI Research"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-none text-gray-900 placeholder-gray-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                    A brief description that students will see when browsing mentors
                </p>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-100">
                <h3 className="text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm">
                        💡
                    </span>
                    Quick Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Use your real name or a professional nickname for authenticity</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Keep your description clear and highlight your key expertise</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>A friendly profile picture helps students connect with you</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
