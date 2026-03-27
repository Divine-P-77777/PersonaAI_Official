
import Link from 'next/link';
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
    return (
        <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-100">
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-700 font-medium tracking-wide">
                                Your personal AI mentor, anytime
                            </span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                            Learn from the{' '}
                            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-rose-600 bg-clip-text text-transparent">
                                best mentors
                            </span>
                            , whenever you need
                        </h1>

                        <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
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
                        <div className="flex gap-10 pt-4 border-t border-orange-100/50">
                            <div>
                                <div className="text-3xl font-bold text-gray-900">500+</div>
                                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">AI Mentors</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900">50K+</div>
                                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Conversations</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900">24/7</div>
                                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Available</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Image */}
                    <div className="relative">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                            <Image
                                src="https://images.unsplash.com/photo-1512238972088-8acb84db0771?q=80&w=1080"
                                alt="Students learning together"
                                fill
                                priority
                                className="object-cover hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        {/* Floating cards */}
                        <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl rotate-3 shadow-lg flex items-center justify-center text-white">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <div>
                                    <div className="text-base font-bold text-gray-900">Dr. Sarah Chen</div>
                                    <div className="text-sm font-medium text-gray-500">CS Professor @ MIT</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl -rotate-3 shadow-lg flex items-center justify-center text-white">
                                    <MessageCircle className="w-7 h-7" />
                                </div>
                                <div>
                                    <div className="text-base font-bold text-gray-900">Alex Kumar</div>
                                    <div className="text-sm font-medium text-gray-500">Senior Tech Lead</div>
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
