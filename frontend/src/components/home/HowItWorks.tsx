import { Search, MessageCircle, Sparkles, Upload, Settings, Rocket } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HowItWorks() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const studentStepsRef = useRef<HTMLDivElement[]>([]);
    const mentorStepsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Student steps animation
            const studentSteps = studentStepsRef.current.filter(Boolean);
            if (studentSteps.length > 0) {
                gsap.fromTo(studentSteps, 
                    { y: 20, opacity: 0 },
                    { 
                        scrollTrigger: {
                            trigger: studentSteps[0],
                            start: 'top 90%',
                            once: true
                        },
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: 'power2.out',
                        force3D: true,
                        overwrite: 'auto'
                    }
                );
            }

            // Mentor steps animation
            const mentorSteps = mentorStepsRef.current.filter(Boolean);
            if (mentorSteps.length > 0) {
                gsap.fromTo(mentorSteps, 
                    { y: 20, opacity: 0 },
                    { 
                        scrollTrigger: {
                            trigger: mentorSteps[0],
                            start: 'top 92%',
                            once: true
                        },
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: 'power2.out',
                        force3D: true,
                        overwrite: 'auto'
                    }
                );
            }

            ScrollTrigger.refresh();
        }, sectionRef);

        return () => ctx.revert();
    }, []);

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
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                        How PersonaBot{' '}
                        <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
                            works
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Whether you're seeking guidance or sharing knowledge, we make it simple
                    </p>
                </div>

                <div className="space-y-24">
                    {/* For Students */}
                    <div ref={sectionRef}>
                        <div className="text-center mb-12">
                            <span className="inline-flex items-center gap-2 px-6 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-bold border border-orange-100 shadow-sm">
                                <Search className="w-4 h-4" />
                                For Students
                            </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {studentSteps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div 
                                        key={index} 
                                        ref={(el) => { if (el) studentStepsRef.current[index] = el; }}
                                        className="relative group pt-4"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                                                <Icon className="w-10 h-10 text-white" />
                                            </div>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 bg-white rounded-2xl border-2 border-orange-100 flex items-center justify-center shadow-lg font-bold text-orange-700 z-10">
                                                {index + 1}
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                            <p className="text-gray-600 leading-relaxed text-[15px]">{step.description}</p>
                                        </div>
                                        {index < studentSteps.length - 1 && (
                                            <div className="hidden lg:block absolute top-14 left-[65%] w-[70%] h-[2px] bg-gradient-to-r from-orange-200/50 via-orange-100/30 to-transparent"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center justify-center py-4">
                        <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1 max-w-md"></div>
                        <span className="px-6 py-2 bg-white rounded-2xl border border-gray-100 text-gray-500 font-semibold italic shadow-sm">vs</span>
                        <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1 max-w-md"></div>
                    </div>

                    {/* For Mentors */}
                    <div>
                        <div className="text-center mb-12">
                            <span className="inline-flex items-center gap-2 px-6 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-bold border border-pink-100 shadow-sm">
                                <Rocket className="w-4 h-4" />
                                For Mentors
                            </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {creatorSteps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div 
                                        key={index} 
                                        ref={(el) => { if (el) mentorStepsRef.current[index] = el; }}
                                        className="relative group pt-4"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                                                <Icon className="w-10 h-10 text-white" />
                                            </div>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 bg-white rounded-2xl border-2 border-pink-100 flex items-center justify-center shadow-lg font-bold text-pink-700 z-10">
                                                {index + 1}
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                            <p className="text-gray-600 leading-relaxed text-[15px]">{step.description}</p>
                                        </div>
                                        {index < creatorSteps.length - 1 && (
                                            <div className="hidden lg:block absolute top-14 left-[65%] w-[70%] h-[2px] bg-gradient-to-r from-pink-200/50 via-pink-100/30 to-transparent"></div>
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
