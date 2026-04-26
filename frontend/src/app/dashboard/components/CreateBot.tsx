import { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, User, Sparkles, Upload, Eye, X } from 'lucide-react';
import { BasicInfo } from './BasicInfo';
import { PersonaConfig } from './PersonaConfig';
import { DataSources } from './DataSources';
import { Review } from './Review';
import { IngestionProgress } from './IngestionProgress';
import { api } from '../../../services/api';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../hooks/useToast';

export type BotFormData = {
    botName: string;
    botDescription: string;
    avatarUrl: string;

    // Persona Config
    greeting: string;
    tone: string;
    expertise: string[];
    experience: Array<{
        title: string;
        company: string;
        years: number;
    }>;
    education: Array<{
        degree: string;
        institute: string;
        year: number;
    }>;
    links: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
    };

    // Data Sources
    dataSources: Array<{
        type: 'pdf' | 'image' | 'long_text' | 'web_link' | 'video_link';
        title: string;
        content?: string;
        url?: string;
        file?: File;
    }>;
};

const steps = [
    { id: 1, name: 'Basic Info', icon: User },
    { id: 2, name: 'Your Persona', icon: Sparkles },
    { id: 3, name: 'Upload Data', icon: Upload },
    { id: 4, name: 'Review', icon: Eye },
    { id: 5, name: 'Training', icon: Sparkles }
];

export function CreateBot() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [batchId, setBatchId] = useState<string | null>(null);
    const [createdBotId, setCreatedBotId] = useState<string | null>(null);
    const router = useRouter();
    const { showSuccess, showError } = useToast();

    const [formData, setFormData] = useState<BotFormData>({
        botName: '',
        botDescription: '',
        avatarUrl: '',
        greeting: '',
        tone: 'professional',
        expertise: [],
        experience: [],
        education: [],
        links: {},
        dataSources: []
    });

    // Auto-populate avatar from user profile if available
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const user = await api.getCurrentUser();
                if (user.avatar_url) {
                    setFormData(prev => ({ ...prev, avatarUrl: user.avatar_url || "" }));
                }
            } catch (err) {
                console.error("Failed to fetch user profile for default avatar:", err);
            }
        };
        fetchUserProfile();
    }, []);

    const updateFormData = (data: Partial<BotFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const validateStep = () => {
        if (currentStep === 1) {
            if (!formData.botName.trim() || !formData.botDescription.trim()) {
                showError('Please fill in the Bot Name and Description to continue');
                return false;
            }
        } else if (currentStep === 2) {
            if (!formData.greeting.trim() || !formData.tone) {
                showError('Please provide a Greeting Message and choose a Tone to continue');
                return false;
            }
            if (formData.expertise.length === 0) {
                showError('Please add at least one area of expertise');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep() && currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep === 1) {
            if (window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
                router.push('/dashboard');
            }
        } else if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Create Bot Base Metadata
            const botResponse = await api.createBot({
                name: formData.botName,
                description: formData.botDescription,
                persona_config: {
                    greeting: formData.greeting,
                    tone: formData.tone,
                    expertise: formData.expertise,
                    experience: formData.experience,
                    education: formData.education,
                    links: formData.links
                }
            });

            const botId = botResponse.id;

            // 1.5 Upload Avatar if present (Fix: Bot avatar was ignored during creation)
            if (formData.avatarUrl && formData.avatarUrl.startsWith("data:")) {
                try {
                    const response = await fetch(formData.avatarUrl);
                    const blob = await response.blob();
                    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
                    await api.uploadBotAvatar(botId, file);
                } catch (avatarErr) {
                    console.error("Failed to upload bot avatar during creation:", avatarErr);
                    // We don't fail the whole process if just the avatar fails
                }
            }

            // 2. Handle Data Sources (if any)
            if (formData.dataSources.length > 0) {
                const textAndLinkSources = formData.dataSources
                    .filter(s => ['long_text', 'web_link', 'video_link'].includes(s.type))
                    .map(s => ({
                        type: s.type,
                        title: s.title,
                        content: s.content,
                        url: s.url
                    }));

                const files = formData.dataSources
                    .filter(s => s.file)
                    .map(s => s.file as File);

                const fileSourcesMetadata = formData.dataSources
                    .filter(s => s.file)
                    .map(s => ({
                        type: s.type,
                        title: s.title
                    }));

                // Call ingestion endpoint
                const batchResponse = await api.createIngestionBatch(
                    botId,
                    [...textAndLinkSources, ...fileSourcesMetadata],
                    files
                );
                setBatchId(batchResponse.id);
            }

            setCreatedBotId(botId);
            setCurrentStep(5); // Move to real-time progress step
            showSuccess('Bot created! Now indexing documents...');

        } catch (err: any) {
            console.error('Submission failed:', err);
            const msg = err.message || 'Something went wrong during bot creation.';
            setError(msg);
            showError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl text-gray-900 mb-4 font-black tracking-tight">
                        Create Your{' '}
                        <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                            AI Persona
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 font-medium">
                        Share your knowledge and experience with students around the world
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-12 overflow-x-auto pb-4">
                    <div className="flex items-center justify-between min-w-[600px]">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex-1 flex items-center">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg'
                                                : isActive
                                                    ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white ring-4 ring-orange-100 shadow-xl'
                                                    : 'bg-gray-200 text-gray-400'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <div
                                                className={`text-xs font-bold uppercase tracking-wider ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                                                    }`}
                                            >
                                                {step.name}
                                            </div>
                                        </div>
                                    </div>

                                    {index < steps.length - 1 && (
                                        <div
                                            className={`h-1 flex-1 mx-4 rounded-full transition-all duration-500 ${isCompleted
                                                ? 'bg-gradient-to-r from-orange-400 to-pink-500'
                                                : 'bg-gray-200'
                                                }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white rounded-[40px] shadow-2xl shadow-orange-500/5 p-6 sm:p-10 lg:p-12 mb-8 border border-white">
                    {currentStep === 1 && (
                        <BasicInfo formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentStep === 2 && (
                        <PersonaConfig formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentStep === 3 && (
                        <DataSources formData={formData} updateFormData={updateFormData} />
                    )}
                    {currentStep === 4 && (
                        <Review formData={formData} />
                    )}
                    {currentStep === 5 && (createdBotId || batchId) && (
                        <IngestionProgress
                            botId={createdBotId || ''}
                            batchId={batchId}
                        />
                    )}
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-8 p-6 bg-red-50 border-l-8 border-red-500 text-red-700 rounded-r-[32px] flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <X className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-black text-lg uppercase tracking-tight">Bot Creation Failed</h3>
                            <p className="text-sm mt-1 font-semibold opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < 5 && (
                    <div className="flex justify-between items-center px-2">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-8 py-4 rounded-3xl transition-all bg-white text-gray-700 border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl hover:text-red-500 font-bold"
                            aria-label={currentStep === 1 ? "Exit Bot Creation" : "Go back to previous step"}
                        >
                            {currentStep === 1 ? (
                                <>
                                    <X className="w-5 h-5 text-red-500" />
                                    Exit
                                </>
                            ) : (
                                <>
                                    <ArrowLeft className="w-5 h-5" />
                                    Back
                                </>
                            )}
                        </button>

                        <div className="flex gap-4">
                            {currentStep < 4 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl hover:shadow-2xl hover:scale-105 transition-all font-bold"
                                    aria-label="Proceed to next step"
                                >
                                    Next Step
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-3xl hover:shadow-2xl hover:scale-105 transition-all font-bold ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    aria-label="Submit bot creation form"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating Persona...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Finish & Train
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
