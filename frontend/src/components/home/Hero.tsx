
import Link from 'next/link';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ 
                defaults: { 
                    ease: 'power3.out',
                    force3D: true,
                    overwrite: 'auto'
                } 
            });

            // Text content entrance
            if (textRef.current) {
                const elements = gsap.utils.toArray(Array.from(textRef.current.children));
                gsap.set(elements, { opacity: 0, y: 30 });
                tl.to(elements, {
                    y: 0,
                    opacity: 1,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: 'power3.out'
                }, 0.1);
            }

            // Image entrance
            if (imageRef.current) {
                tl.fromTo(imageRef.current, 
                    { scale: 0.9, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
                    0.3
                );
            }

            // Floating cards entrance
            const floatingCards = [card1Ref.current, card2Ref.current].filter(Boolean);
            if (floatingCards.length > 0) {
                tl.fromTo(floatingCards,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'back.out(1.7)' },
                    0.6
                );
            }

            // Continuous floating animation
            if (floatingCards.length > 0) {
                gsap.to(floatingCards, {
                    y: '+=15',
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    stagger: {
                        each: 0.5,
                        repeat: -1,
                        yoyo: true
                    }
                });
            }
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={heroRef} className="pt-24 lg:pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white overflow-hidden relative min-h-[90vh] flex items-center">
            {/* Animated Decorative Blobs */}
            <div className="absolute top-20 left-[-10%] w-[40%] h-[40%] bg-orange-200/30 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-20 right-[-10%] w-[40%] h-[40%] bg-pink-200/20 blur-[120px] rounded-full animate-pulse delay-1000" />
            
            <div className="max-w-7xl mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div ref={textRef} className="space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-100">
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-700 font-medium tracking-wide">
                                Your personal AI mentor, anytime
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                            Learn from the{' '}
                            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
                                best mentors
                            </span>
                            , whenever you need
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                            Connect with AI-powered personas of alumni, professors, and professionals.
                            Get personalized guidance, career advice, and knowledge—all through natural conversations.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                href="/explore" 
                                className="group px-8 py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 font-semibold"
                            >
                                Start Chatting
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="/signup" 
                                className="px-8 py-4 bg-white text-gray-700 rounded-full border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                            >
                                <MessageCircle className="w-5 h-5 text-orange-400" />
                                Create Your Bot
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 md:gap-10 pt-4 border-t border-orange-100/50">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">500+</div>
                                <div className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider">AI Mentors</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">50K+</div>
                                <div className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider">Sessions</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">24/7</div>
                                <div className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider">Available</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Image */}
                    <div className="relative mt-12 lg:mt-0">
                        <div ref={imageRef} className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-[12px] border-white/50 backdrop-blur-sm">
                                <Image
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200"
                                    alt="Students collaborating and learning with AI-powered mentors in a modern setting"
                                    fill
                                    priority
                                    className="object-cover hover:scale-105 transition-transform duration-1000"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                        </div>
                        {/* Floating cards */}
                        <div ref={card1Ref} className="absolute -bottom-6 -left-4 md:-bottom-8 md:-left-12 bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white max-w-[200px] md:max-w-none">
                            <div className="flex items-center gap-3 md:gap-5">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl rotate-3 shadow-lg flex items-center justify-center text-white shrink-0">
                                    <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div>
                                    <div className="text-sm md:text-lg font-bold text-gray-900 truncate">Dr. Anjali Desai</div>
                                    <div className="text-[10px] md:text-sm font-semibold text-gray-500">CS Professor @ IIT</div>
                                </div>
                            </div>
                        </div>
                        <div ref={card2Ref} className="absolute -top-6 -right-4 md:-top-10 md:-right-12 bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white max-w-[200px] md:max-w-none">
                            <div className="flex items-center gap-3 md:gap-5">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl -rotate-3 shadow-lg flex items-center justify-center text-white shrink-0">
                                    <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div>
                                    <div className="text-sm md:text-lg font-bold text-gray-900 truncate">Vikram Singh</div>
                                    <div className="text-[10px] md:text-sm font-semibold text-gray-500">Senior Tech Lead</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative blob */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-100/50 blur-[100px] rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
