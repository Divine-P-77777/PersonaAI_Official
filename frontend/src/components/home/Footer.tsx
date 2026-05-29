import Link from 'next/link';
import { Mail } from 'lucide-react';
import { CiLinkedin } from "react-icons/ci";
import { BsTwitterX, BsGithub } from "react-icons/bs";


export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="AskMentor" className="w-8 h-8 object-contain" />
                            <span className="font-semibold text-xl text-white">AskMentor</span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Connecting learners with AI-powered mentors for personalized guidance and growth.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-white mb-4">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/explore" className="hover:text-white transition-colors">Explore</Link></li>
                            <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                            <li><Link href="/billing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/signup" className="hover:text-white transition-colors">Use Cases</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-white mb-4">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-400">
                        © 2026 AskMentor. All rights reserved.
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4">
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                            aria-label="Twitter"
                        >
                            <BsTwitterX className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                            aria-label="LinkedIn"
                        >
                            <CiLinkedin className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                            aria-label="GitHub"
                        >
                            <BsGithub className="w-5 h-5" />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                            aria-label="Email"
                        >
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
