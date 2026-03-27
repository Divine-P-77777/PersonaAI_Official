import { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, User, Sparkles, Upload, Eye, X } from 'lucide-react';
import { BasicInfo } from './BasicInfo';
import { PersonaConfig } from './PersonaConfig';
import { DataSources } from './DataSources';
import { Review } from './Review';
import { api } from '../../../services/api';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../hooks/useToast';

export type BotFormData = {
    // Basic Info
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
    { id: 4, name: 'Review', icon: Eye }
];

export function CreateBot() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
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

    const updateFormData = (data: Partial<BotFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
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
                await api.createIngestionBatch(
                    botId, 
                    [...textAndLinkSources, ...fileSourcesMetadata],
                    files
                );
            }

            setIsSuccess(true);
            showSuccess('Persona created successfully! Redirecting to dashboard...');
            setTimeout(() => {
                router.push(`/dashboard/${botId}`);
            }, 2000);

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
                    <h1 className="text-4xl lg:text-5xl text-gray-900 mb-4">
                        Create Your{' '}
                        <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                            AI Persona
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Share your knowledge and experience with students around the world
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex-1 flex items-center">
                                    <div className="flex flex-col items-center flex-1">
                                        {/* Step Circle */}
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                                                ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white'
                                                : isActive
                                                    ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white ring-4 ring-orange-100'
                                                    : 'bg-gray-200 text-gray-400'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-6 h-6" />
                                            ) : (
                                                <Icon className="w-6 h-6" />
                                            )}
                                        </div>
                                        {/* Step Label */}
                                        <div className="mt-2 text-center">
                                            <div
                                                className={`text-sm ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                                                    }`}
                                            >
                                                {step.name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Connector Line */}
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`h-1 flex-1 mx-4 rounded transition-all ${isCompleted
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
                <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-8">
                    {/* Form Content Placeholder */}

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
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${currentStep === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg'
                            }`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    {currentStep < steps.length ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full hover:shadow-xl transition-all"
                        >
                            Next Step
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full hover:shadow-xl transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating Bot...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Create Bot
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
