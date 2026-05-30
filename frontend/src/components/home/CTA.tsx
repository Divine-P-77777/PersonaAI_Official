import Link from 'next/link';
import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export function CTA() {
    return (
        <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="relative rounded-[3rem] bg-gray-900 px-8 py-20 shadow-2xl overflow-hidden md:px-20 md:py-24 transition-all">
                    {/* Background Image/Pattern */}
                    <div className="absolute inset-0 z-0 opacity-30">
                        <Image
                            src="https://images.unsplash.com/photo-1512238972088-8acb84db0771?q=80&w=1200"
                            alt="Mentors and mentees collaborating in a modern, vibrant professional environment"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
                    </div>

                    {/* Warm Glows */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-500/20 blur-[100px] rounded-full" />

                    <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
                                <Sparkles className="w-4 h-4 text-orange-400" />
                                <span className="text-sm text-white font-medium uppercase tracking-wider">Ready to start?</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                                Transform your{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                                    learning journey
                                    </span>{' '}
                                    today.
                            </h2>

                            <p className="text-xl text-gray-300 leading-relaxed mb-12">
                                Join thousands of students who are already getting personalized guidance from AI-powered mentors. Your next breakthrough is just one conversation away.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link 
                                    href="/signup" 
                                    className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-2xl hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 font-bold text-lg"
                                >
                                    Get Started Now
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link 
                                    href="/explore" 
                                    className="px-10 py-5 bg-white/10 backdrop-blur-md text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2 font-bold text-lg"
                                >
                                    <MessageSquare className="w-6 h-6 text-orange-400" />
                                    Explore Mentors
                                </Link>
                            </div>
                        </div>

                        {/* Social Proof / Trust */}
                        <div className="hidden lg:block">
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: 'Success Rate', value: '98%' },
                                    { label: 'Active Learners', value: '10K+' },
                                    { label: 'Expert Mentors', value: '500+' },
                                    { label: 'Daily Chats', value: '25K+' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-white/30 transition-colors">
                                        <div className="text-sm font-medium text-orange-400 uppercase tracking-widest mb-2">{stat.label}</div>
                                        <div className="text-4xl font-black text-white">{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
