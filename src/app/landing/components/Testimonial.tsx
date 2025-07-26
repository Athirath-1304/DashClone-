"use client";
import { motion } from "framer-motion";

export default function Testimonial() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-[#181c2a] to-[#0f172a] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative max-w-xl mx-auto bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-10 border border-white/20 flex flex-col items-center text-center"
      >
        {/* Blurred background shape */}
        <div className="absolute -inset-6 z-0 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-2xl" />
        {/* Emoji Avatar */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-3xl mb-4 shadow-lg border-2 border-white/30">
          🍕
        </div>
        <blockquote className="relative z-10 text-xl md:text-2xl text-white font-semibold italic mb-6">
          “DashClone has revolutionized our entire delivery workflow.”
        </blockquote>
        <div className="relative z-10 text-slate-300 font-medium mb-1">Head of Ops, Urban Pizza</div>
        <div className="relative z-10 text-slate-500 text-sm">@urbanpizza</div>
      </motion.div>
    </section>
  );
} 