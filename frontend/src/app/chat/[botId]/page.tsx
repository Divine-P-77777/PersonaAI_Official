"use client";

import { use, useEffect, useState } from "react";
import { api } from "../../../services/api";
import { Bot } from "../../../types";
import { ChatInterface } from "../../../components/chat/ChatInterface";
import { motion } from "framer-motion";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function PublicChatPage({ params }: { params: Promise<{ botId: string }> }) {
    const { botId } = use(params);
    const [bot, setBot] = useState<Bot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBot = async () => {
            try {
                const data = await api.getBot(botId);
                // Check if bot is ready or private
                if (data.status !== 'ready') {
                    setError("This persona is currently in draft mode or private.");
                } else {
                    setBot(data);
                }
            } catch (err) {
                console.error("Failed to fetch bot:", err);
                setError("Persona not found or inaccessible.");
            } finally {
                setLoading(false);
            }
        };
        fetchBot();
    }, [botId]);

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mb-4"
                >
                    <Loader2 size={40} className="text-orange-500" />
                </motion.div>
                <p className="text-gray-500 font-medium animate-pulse">Entering Persona Space...</p>
            </div>
        );
    }

    if (error || !bot) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white px-6 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
                    <ShieldAlert size={32} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Persona Unavailable</h1>
                <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
                    {error || "We couldn't find the professional persona you're looking for."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                        href="/explore"
                        className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all"
                    >
                        Explore Personas
                    </Link>
                    <Link 
                        href="/"
                        className="px-8 py-3.5 bg-gray-50 text-gray-700 rounded-2xl font-bold border border-gray-100 hover:bg-gray-100 transition-all"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-screen"
        >
            <ChatInterface bot={bot} />
        </motion.div>
    );
}
