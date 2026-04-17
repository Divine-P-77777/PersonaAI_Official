"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  MessageSquare,
  User,
  ArrowRight,
  Filter,
  ShieldCheck,
  TrendingUp,
  Gem,
  LayoutGrid,
  Zap,
  Share2
} from "lucide-react";
import { api } from "../../services/api";
import { Bot } from "../../types";
import Link from 'next/link';
import { toast } from "react-toastify";

export default function ExplorePage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const data = await api.getExploreBots();
        setBots(data);
      } catch (err) {
        console.error("Failed to fetch personas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBots();
  }, []);

  const handleShare = (e: React.MouseEvent, bot: Bot) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/chat/${bot.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Chat with ${bot.name}`,
        text: `Check out this AI persona of ${bot.name} on PersonaBot!`,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch((err: any) => {
           console.error("Clipboard write failed:", err);
           toast.error("Failed to copy link.");
        });
    }
  };

  const categories = ["All", "Technology", "Business", "Design", "Marketing", "Education", "Healthcare"];

  const filteredBots = bots.filter((bot) => {
    const matchesSearch =
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      bot.persona_config.expertise?.some((exp) =>
        exp.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-orange-100 selection:text-orange-900">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-100/30 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-100/30 blur-[150px] rounded-full" />
      </div>

      {/* Navigation Space Holder */}
      <div className="h-24 lg:h-32" />

      {/* Hero Section */}
      <section className="relative pt-4 pb-20 px-6 lg:px-12 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md rounded-2xl border border-orange-100/50 mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500/20" />
              <span className="text-xs text-orange-950 font-bold tracking-widest uppercase">Verified Experts</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9]">
              Elite Mentors <br />
              <span className="bg-gradient-to-r from-gray-900 via-orange-600 to-pink-600 bg-clip-text text-transparent">
                One Click Away.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
              Connect with hyper-realistic AI twins of industry leaders. Personalized mentorship, available 24/7.
            </p>

            {/* Premium Search & Filter Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="relative p-2.5 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center transition-colors group-focus-within:text-orange-500 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, expertise, or industry..."
                    className="w-full pl-16 pr-6 py-5 bg-transparent outline-none text-gray-900 text-lg font-medium placeholder:text-gray-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 p-1.5 bg-gray-50/50 rounded-[1.8rem]">
                  <button className="flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-[1.5rem] font-bold shadow-sm hover:translate-y-[-2px] transition-all">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Filter</span>
                  </button>
                  <button className="px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold hover:bg-orange-600 hover:shadow-orange-500/20 hover:shadow-2xl transition-all">
                    Search
                  </button>
                </div>
              </div>

              {/* Enhanced Categories */}
              <div className="flex flex-wrap justify-center gap-3 mt-10">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-7 py-3 rounded-2xl text-xs font-bold tracking-widest uppercase transition-all duration-300 ${selectedCategory === cat
                        ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20 scale-105"
                        : "bg-white text-gray-400 hover:text-gray-900 hover:bg-white/80 border border-transparent hover:border-gray-200"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bot Grid Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-40 z-10 relative">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Top Trending Personas</h2>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button className="p-2.5 rounded-lg bg-gray-50 text-gray-900"><LayoutGrid size={18} /></button>
            <button className="p-2.5 rounded-lg text-gray-300 hover:text-gray-400"><LayoutGrid size={18} /></button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full max-w-sm h-[480px] bg-white rounded-[3rem] p-8 space-y-4 animate-pulse">
                <div className="h-40 bg-gray-50 rounded-3xl" />
                <div className="h-6 w-1/2 bg-gray-50 rounded-full" />
                <div className="h-4 w-full bg-gray-50 rounded-full" />
                <div className="h-4 w-2/3 bg-gray-50 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredBots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            <AnimatePresence>
              {filteredBots.map((bot, index) => (
                <motion.div
                  key={bot.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="group relative w-full max-w-sm"
                >
                  <div className="h-[520px] bg-white rounded-[3rem] border border-gray-100/50 shadow-sm hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] hover:-translate-y-3 transition-all duration-700 overflow-hidden flex flex-col p-8 cursor-pointer relative z-10">

                    {/* Premium Status Badge */}
                    <div className="absolute top-8 right-8 z-20">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full text-[10px] font-black tracking-widest text-green-600 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live Now
                      </div>
                    </div>

                    {/* Bot Visual Section */}
                    <div className="relative mb-6 pt-2">
                      <div className="w-20 h-20 rounded-[2.2rem] bg-gradient-to-br from-gray-50 to-white p-1 shadow-2xl transition-transform duration-500 group-hover:scale-110">
                        <div className="w-full h-full rounded-[1.8rem] bg-white p-1 overflow-hidden ring-1 ring-gray-100">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${bot.name}`}
                            alt={bot.name}
                            className="w-full h-full object-cover rounded-[1.5rem]"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-orange-600 transition-colors truncate">
                            {bot.name}
                          </h3>
                          <ShieldCheck size={18} className="text-blue-500 fill-blue-500/10" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                          <User size={10} className="text-gray-300" />
                          Created by {bot.owner?.display_name || "Nexus Network"}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {bot.persona_config.expertise?.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-zinc-50 text-zinc-500 text-[9px] font-black rounded-xl uppercase tracking-widest flex items-center gap-1">
                          <Zap size={9} className="text-orange-400" />
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed font-medium mb-auto">
                      {bot.description || `Specialized AI mentor focused on ${bot.persona_config.expertise?.join(', ')}. Ask anything about industry frameworks or leadership.`}
                    </p>

                    {/* Performance Stats Overlay Header */}
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Success</span>
                          <span className="text-lg font-black text-gray-900 tracking-tight">98%</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Sessions</span>
                          <span className="text-lg font-black text-gray-900 tracking-tight">12.4k</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleShare(e, bot)}
                          className="w-12 h-12 rounded-[1.5rem] bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-all shadow-sm"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <Link
                          href={`/chat/${bot.id}`}
                          className="w-14 h-14 rounded-[1.8rem] bg-gray-900 text-white flex items-center justify-center hover:bg-orange-600 hover:scale-110 active:scale-95 transition-all duration-300 shadow-xl"
                        >
                          <MessageSquare className="w-6 h-6" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Glow */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-orange-400/0 to-pink-500/0 rounded-[4rem] blur-2xl group-hover:from-orange-500/5 group-hover:to-pink-500/5 transition-all duration-700 pointer-events-none -z-10" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-60 bg-white rounded-[4rem] border border-dashed border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-80 h-80 bg-gray-50 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Search className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">No match found</h3>
              <p className="text-gray-400 max-w-sm mx-auto font-medium">Try searching for broader skills or categories.</p>
            </div>
          </div>
        )}
      </section>

      {/* Explore Footer CTA */}
      <section className="bg-white pt-24 pb-32 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-orange-100/50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Gem className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">Ready to digitize your <span className="text-orange-600">Intellect?</span></h2>
          <p className="text-lg text-gray-500 mb-10 font-medium leading-relaxed">Join the world's first network of professional AI personas today.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-[1.8rem] font-bold hover:bg-orange-600 hover:-translate-y-1 transition-all shadow-xl shadow-gray-200"
          >
            Build Your Persona <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
