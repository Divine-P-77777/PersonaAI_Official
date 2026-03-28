import { MessageSquare, Users, Clock, Shield } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Features() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header animation
            if (headerRef.current) {
                gsap.fromTo(headerRef.current, 
                    { y: 20, opacity: 0 },
                    { 
                        scrollTrigger: {
                            trigger: headerRef.current,
                            start: 'top 92%',
                            once: true
                        },
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        ease: 'power2.out',
                        force3D: true
                    }
                );
            }

            // Cards staggered animation
            const cards = cardsRef.current.filter(Boolean);
            if (cards.length > 0) {
                gsap.fromTo(cards, 
                    { y: 30, opacity: 0 },
                    { 
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: 'top 85%',
                            once: true
                        },
                        y: 0,
                        opacity: 1,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: 'power2.out',
                        force3D: true,
                        overwrite: 'auto'
                    }
                );
            }

            ScrollTrigger.refresh();
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const features = [
        {
            icon: MessageSquare,
            title: 'Natural Conversations',
            description: 'Chat naturally with AI mentors through text or voice. Ask questions, get advice, and learn at your own pace.',
            color: 'from-orange-400 to-amber-500'
        },
        {
            icon: Users,
            title: 'Personalized Knowledge',
            description: 'Each bot represents real experiences and expertise from alumni and professionals in various fields.',
            color: 'from-pink-400 to-rose-500'
        },
        {
            icon: Clock,
            title: 'Available 24/7',
            description: 'No more waiting for office hours. Get instant answers and guidance whenever inspiration strikes.',
            color: 'from-amber-400 to-orange-500'
        },
        {
            icon: Shield,
            title: 'Safe & Private',
            description: 'Your conversations are secure and private. Learn freely without judgment or limitations.',
            color: 'from-rose-400 to-pink-500'
        }
    ];

    return (
        <section id="features" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                        Everything you need to{' '}
                        <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
                            grow
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Connect with mentors, gain insights, and accelerate your learning journey
                    </p>
                </div>

                {/* Features Grid */}
                <div ref={containerRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                ref={(el) => { if (el) cardsRef.current[index] = el; }}
                                className="group p-8 glass-card glass-card-hover rounded-[2rem] border border-orange-100/50"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-lg`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-[15px]">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
