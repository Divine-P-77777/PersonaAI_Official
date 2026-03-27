import { Search, MessageCircle, Sparkles, Upload, Settings, Rocket } from 'lucide-react';

export function HowItWorks() {
    const studentSteps = [
        {
            icon: Search,
            title: 'Browse Mentors',
            description: 'Explore AI bots created by alumni, professors, and professionals across different fields.',
            color: 'from-orange-400 to-amber-500'
        },
        {
            icon: MessageCircle,
            title: 'Start Chatting',
            description: 'Choose text or voice mode and begin your conversation. Ask anything!',
            color: 'from-pink-400 to-rose-500'
        },
        {
            icon: Sparkles,
            title: 'Get Personalized Advice',
            description: 'Receive guidance based on real experiences and expertise. Learn and grow!',
            color: 'from-rose-400 to-pink-500'
        }
    ];

    const creatorSteps = [
        {
            icon: Upload,
            title: 'Share Your Story',
            description: 'Upload your resume, research papers, or documents that represent your journey.',
            color: 'from-orange-400 to-amber-500'
        },
        {
            icon: Settings,
            title: 'Define Your Persona',
            description: 'Set your personality, expertise areas, and the way you want to help others.',
            color: 'from-pink-400 to-rose-500'
        },
        {
            icon: Rocket,
            title: 'Make an Impact',
            description: 'Your AI mentor goes live! Help countless students while you focus on your work.',
            color: 'from-amber-400 to-orange-500'
        }
    ];

    return (
        <section id="how-it-works" className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">
                        How PersonaBot{' '}
                        <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                            works
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600">
                        Whether you're seeking guidance or sharing knowledge, we make it simple
                    </p>
                </div>

                <div className="space-y-16">
                    {/* For Students */}
                    <div>
                        <div className="text-center mb-8">
                            <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm">
                                For Students
                            </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {studentSteps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={index} className="relative">
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                                                <span className="text-sm text-gray-700">{index + 1}</span>
                                            </div>
                                            <h3 className="text-xl text-gray-900 mb-2">{step.title}</h3>
                                            <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                        </div>
                                        {index < studentSteps.length - 1 && (
                                            <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center justify-center">
                        <div className="h-px bg-gray-200 flex-1 max-w-xs"></div>
                        <span className="px-4 text-gray-400">or</span>
                        <div className="h-px bg-gray-200 flex-1 max-w-xs"></div>
                    </div>

                    {/* For Creators */}
                    <div>
                        <div className="text-center mb-8">
                            <span className="inline-block px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm">
                                For Mentors
                            </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {creatorSteps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={index} className="relative">
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                                                <span className="text-sm text-gray-700">{index + 1}</span>
                                            </div>
                                            <h3 className="text-xl text-gray-900 mb-2">{step.title}</h3>
                                            <p className="text-gray-600 leading-relaxed">{step.description}</p>
                                        </div>
                                        {index < creatorSteps.length - 1 && (
                                            <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
