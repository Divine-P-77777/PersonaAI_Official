import { GraduationCap, Briefcase, Code, Heart, BookOpen, TrendingUp, LucideIcon } from 'lucide-react';
import Image from 'next/image';

interface UseCase {
    icon: LucideIcon;
    title: string;
    description: string;
    image: string;
    color: string;
}

export function UseCases() {
    const useCases: UseCase[] = [
        {
            icon: GraduationCap,
            title: 'Academic Guidance',
            description: 'Get help with course selection, study tips, and academic planning from experienced alumni.',
            image: 'https://images.unsplash.com/photo-1758270705518-b61b40527e76?q=80&w=800',
            color: 'from-orange-400 to-amber-500'
        },
        {
            icon: Briefcase,
            title: 'Career Development',
            description: 'Learn about different career paths, interview prep, and industry insights from professionals.',
            image: 'https://images.unsplash.com/photo-1761039808597-5639866bab8a?q=80&w=800',
            color: 'from-pink-400 to-rose-500'
        },
        {
            icon: Code,
            title: 'Technical Skills',
            description: 'Master new programming languages, frameworks, and tools with guidance from tech experts.',
            image: 'https://images.unsplash.com/photo-1512238972088-8acb84db0771?q=80&w=800',
            color: 'from-blue-400 to-cyan-500'
        },
        {
            icon: Heart,
            title: 'Personal Growth',
            description: 'Find mentors who can guide you on work-life balance, confidence, and personal development.',
            image: 'https://images.unsplash.com/photo-1758270705518-b61b40527e76?q=80&w=800',
            color: 'from-purple-400 to-indigo-500'
        },
        {
            icon: BookOpen,
            title: 'Research Support',
            description: 'Connect with researchers and academics for guidance on projects, papers, and methodologies.',
            image: 'https://images.unsplash.com/photo-1761039808597-5639866bab8a?q=80&w=800',
            color: 'from-green-400 to-emerald-500'
        },
        {
            icon: TrendingUp,
            title: 'Entrepreneurship',
            description: 'Get startup advice, business strategy insights, and entrepreneurial wisdom from founders.',
            image: 'https://images.unsplash.com/photo-1512238972088-8acb84db0771?q=80&w=800',
            color: 'from-violet-400 to-purple-500'
        }
    ];

    return (
        <section id="use-cases" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Guidance for{' '}
                        <span className="bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
                            every journey
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Whatever your goals, there's a mentor ready to help you succeed
                    </p>
                </div>

                {/* Use Cases Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {useCases.map((useCase, index) => {
                        const Icon = useCase.icon;
                        return (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500"
                            >
                                {/* Image Overlay Container */}
                                <div className="absolute inset-x-0 bottom-0 h-2/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-orange-50 via-white/50 to-transparent" />
                                    <Image
                                        src={useCase.image}
                                        alt={useCase.title}
                                        fill
                                        className="object-cover opacity-20 group-hover:scale-110 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>

                                {/* Content */}
                                <div className="relative p-8 z-10 flex flex-col h-full">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${useCase.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-gray-200`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                                        {useCase.title}
                                    </h3>
                                    <p className="text-gray-600 text-lg leading-relaxed group-hover:text-gray-700 transition-colors">
                                        {useCase.description}
                                    </p>
                                    
                                    <div className="mt-8 flex items-center gap-2 text-orange-500 font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                        <span>Explore Path</span>
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
