import Link from 'next/link';
import { Menu, X, ChevronDown, LogOut, User as UserIcon, Layout, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check initial session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsDropdownOpen(false);
        router.push('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-[100] border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <img src="/logo.png" alt="PersonaBot" className="w-9 h-9 object-contain" />
                            <span className="font-semibold text-xl text-gray-900">PersonaBot</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/explore" className="text-sm font-semibold text-gray-600 hover:text-orange-700 transition-colors">
                            Explore
                        </Link>
                        
                        {user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-100 to-pink-100 p-0.5 border border-orange-200">
                                        <img 
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                                            alt="User" 
                                            className="w-full h-full rounded-full bg-white object-cover"
                                        />
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-[-1]" 
                                                onClick={() => setIsDropdownOpen(false)} 
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden"
                                            >
                                                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Account</p>
                                                    <p className="text-xs font-bold text-gray-900 truncate">{user.email}</p>
                                                </div>
                                                
                                                <Link 
                                                    href="/dashboard"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                                                >
                                                    <Layout size={18} className="text-gray-400" />
                                                    Dashboard
                                                </Link>
                                                
                                                <button 
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <LogOut size={18} />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/signin" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/signup" className="px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all text-sm font-bold">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-6 space-y-4">
                            <Link
                                href="/explore"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-base font-bold text-gray-900 hover:bg-gray-50 rounded-2xl transition-colors"
                            >
                                <Sparkles size={20} className="text-orange-600" />
                                Explore Personas
                            </Link>

                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-base font-bold text-gray-900 hover:bg-gray-50 rounded-2xl transition-colors"
                                    >
                                        <Layout size={20} className="text-gray-400" />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors text-left"
                                    >
                                        <LogOut size={20} />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Link 
                                        href="/signin" 
                                        className="flex items-center justify-center py-3 text-base font-bold text-gray-900 bg-gray-50 rounded-2xl"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link 
                                        href="/signup" 
                                        className="flex items-center justify-center py-3 text-base font-bold text-white bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl shadow-lg"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
