import { MessageSquare, Users, Clock, Shield } from 'lucide-react';

export function Features() {
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
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl lg:text-5xl text-gray-900 mb-4">
                        Everything you need to{' '}
                        <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                            grow
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600">
                        Connect with mentors, gain insights, and accelerate your learning journey
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
