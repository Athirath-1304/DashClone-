"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function VisualSection() {
  return (
    <section className="relative py-24 px-4 bg-gradient-to-b from-[#1e193a] to-[#181c2a] flex flex-col items-center justify-center">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Animated Dashboard Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full md:w-1/2 flex justify-center"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/30 via-purple-500/20 to-pink-500/20 blur-2xl z-0 animate-pulse" />
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            {/* Replace src with your real dashboard image if available */}
            <Image
              src="/window.svg"
              alt="DashClone Dashboard Mockup"
              width={480}
              height={300}
              className="w-[350px] h-[220px] md:w-[480px] md:h-[300px] object-cover object-top rounded-3xl border border-white/10 shadow-xl"
            />
          </div>
        </motion.div>
        {/* Text Block */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full md:w-1/2 text-center md:text-left"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            One Platform. Total Control.
          </h3>
          <p className="text-slate-300 text-lg max-w-md mx-auto md:mx-0">
            Manage every aspect of your food delivery business from a single, beautiful dashboard. Real-time insights, seamless operations, and total peace of mind.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 