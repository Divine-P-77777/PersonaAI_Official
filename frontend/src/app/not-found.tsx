"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#EAEEF1] flex flex-col items-center justify-center p-6 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Placeholder for the 404 GIF */}
        <div className="w-full aspect-square relative overflow-hidden  flex items-center justify-center ">
          <img
            src="/notfound.gif"
            alt="Not Found"
            className="w-full h-full object-cover"
          />
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-4 mb-10 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95 duration-300"
        >
          Return Home
        </Link>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
          Lost in the AskMentor?
        </h1>

        <p className="text-gray-500 font-medium mb-8">
          The AskMentor or page you're looking for has vanished into the digital void. Let's get you back home.
        </p>


      </motion.div>
    </main>
  );
}
