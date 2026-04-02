import { Plus, X, Briefcase, GraduationCap, Link as LinkIcon } from 'lucide-react';
import { BotFormData } from './CreateBot';

interface PersonaConfigProps {
    formData: BotFormData;
    updateFormData: (data: Partial<BotFormData>) => void;
}

export function PersonaConfig({ formData, updateFormData }: PersonaConfigProps) {
    const tones = [
        { value: 'professional', label: 'Professional', emoji: '💼' },
        { value: 'friendly', label: 'Friendly', emoji: '😊' },
        { value: 'casual', label: 'Casual', emoji: '👋' },
        { value: 'academic', label: 'Academic', emoji: '🎓' },
        { value: 'enthusiastic', label: 'Enthusiastic', emoji: '🌟' }
    ];

    const addExpertise = () => {
        const input = document.getElementById('expertise-input') as HTMLInputElement;
        if (input.value.trim()) {
            updateFormData({ expertise: [...formData.expertise, input.value.trim()] });
            input.value = '';
        }
    };

    const removeExpertise = (index: number) => {
        updateFormData({ expertise: formData.expertise.filter((_, i) => i !== index) });
    };

    const addExperience = () => {
        updateFormData({
            experience: [
                ...formData.experience,
                { title: '', company: '', years: 1 }
            ]
        });
    };

    const updateExperience = (index: number, field: keyof BotFormData['experience'][0], value: string | number) => {
        const updated = [...formData.experience];
        updated[index] = { ...updated[index], [field]: value };
        updateFormData({ experience: updated });
    };

    const removeExperience = (index: number) => {
        updateFormData({ experience: formData.experience.filter((_, i) => i !== index) });
    };

    const addEducation = () => {
        updateFormData({
            education: [
                ...formData.education,
                { degree: '', institute: '', year: new Date().getFullYear() }
            ]
        });
    };

    const updateEducation = (index: number, field: keyof BotFormData['education'][0], value: string | number) => {
        const updated = [...formData.education];
        updated[index] = { ...updated[index], [field]: value };
        updateFormData({ education: updated });
    };

    const removeEducation = (index: number) => {
        updateFormData({ education: formData.education.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl text-gray-900 mb-2">Define your persona</h2>
                <p className="text-gray-600">Help your AI represent you authentically</p>
            </div>

            {/* Greeting */}
            <div>
                <label className="block text-sm text-gray-700 mb-2">
                    Greeting Message <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.greeting}
                    onChange={(e) => updateFormData({ greeting: e.target.value })}
                    placeholder="e.g., Hi! I'm Sarah. I've spent 15 years teaching CS and researching AI. I'm here to help you with your academic journey, career questions, or just chat about tech!"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-none text-gray-900 placeholder-gray-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                    This is the first message students will see when they chat with your bot
                </p>
            </div>

            {/* Tone */}
            <div>
                <label className="block text-sm text-gray-700 mb-3">
                    Conversation Tone <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {tones.map((tone) => (
                        <button
                            key={tone.value}
                            type="button"
                            onClick={() => updateFormData({ tone: tone.value })}
                            className={`p-4 rounded-xl border-2 transition-all ${formData.tone === tone.value
                                    ? 'border-orange-400 bg-orange-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-3xl mb-1">{tone.emoji}</div>
                            <div className="text-sm text-gray-900">{tone.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Expertise */}
            <div>
                <label className="block text-sm text-gray-700 mb-2">
                    Areas of Expertise <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                    <input
                        id="expertise-input"
                        type="text"
                        placeholder="e.g., Machine Learning, Cloud Architecture"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                    />
                    <button
                        type="button"
                        onClick={addExpertise}
                        className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((exp, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 text-gray-800 rounded-full"
                        >
                            {exp}
                            <button
                                type="button"
                                onClick={() => removeExpertise(index)}
                                className="hover:text-red-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Experience */}
            <div>
                <label className="block text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Work Experience
                </label>
                <div className="space-y-4">
                    {formData.experience.map((exp, index) => (
                        <div key={index} className="p-4 border-2 border-gray-200 rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="text-sm text-gray-600">Experience {index + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => removeExperience(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={exp.title}
                                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                    placeholder="Job Title"
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                                />
                                <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                    placeholder="Company"
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                                />
                            </div>
                            <input
                                type="number"
                                value={exp.years}
                                onChange={(e) => updateExperience(index, 'years', parseInt(e.target.value))}
                                placeholder="Years"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addExperience}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Experience
                    </button>
                </div>
            </div>

            {/* Education */}
            <div>
                <label className="block text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Education
                </label>
                <div className="space-y-4">
                    {formData.education.map((edu, index) => (
                        <div key={index} className="p-4 border-2 border-gray-200 rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="text-sm text-gray-600">Education {index + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => removeEducation(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                    placeholder="Degree"
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                                />
                                <input
                                    type="text"
                                    value={edu.institute}
                                    onChange={(e) => updateEducation(index, 'institute', e.target.value)}
                                    placeholder="Institute"
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                                />
                            </div>
                            <input
                                type="number"
                                value={edu.year}
                                onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                                placeholder="Year"
                                min="1950"
                                max="2030"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addEducation}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Education
                    </button>
                </div>
            </div>

            {/* Links */}
            <div>
                <label className="block text-sm text-gray-700 mb-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Professional Links
                </label>
                <div className="space-y-3">
                    <input
                        type="url"
                        value={formData.links.linkedin || ''}
                        onChange={(e) =>
                            updateFormData({ links: { ...formData.links, linkedin: e.target.value } })
                        }
                        placeholder="LinkedIn Profile URL"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                    />
                    <input
                        type="url"
                        value={formData.links.github || ''}
                        onChange={(e) =>
                            updateFormData({ links: { ...formData.links, github: e.target.value } })
                        }
                        placeholder="GitHub Profile URL"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                    />
                    <input
                        type="url"
                        value={formData.links.portfolio || ''}
                        onChange={(e) =>
                            updateFormData({ links: { ...formData.links, portfolio: e.target.value } })
                        }
                        placeholder="Portfolio/Website URL"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder-gray-500"
                    />
                </div>
            </div>
        </div>
    );
}
