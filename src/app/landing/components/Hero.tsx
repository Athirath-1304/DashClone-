"use client";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#312e81] overflow-hidden">
      {/* Floating Beta Badge */}
      <div className="absolute top-8 right-8 z-20">
        <span className="px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg animate-pulse text-sm backdrop-blur-md">
          Now in Beta 🚀
        </span>
      </div>
      {/* Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-white/20"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-xl">
          DashClone
        </h1>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-gradient-x"
        >
          Delivering Tomorrow’s Food Tech — Today
        </motion.h2>
        <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-xl">
          End-to-end food delivery platform for modern restaurants.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition-all backdrop-blur-md border border-white/20"
            onClick={() => router.push("/login")}
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
          <button
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-white/10 text-white font-semibold border border-white/30 shadow hover:bg-white/20 hover:scale-105 transition-all backdrop-blur-md"
            onClick={() => {
              const el = document.getElementById("features");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <PlayCircle className="w-5 h-5" /> See Demo
          </button>
        </div>
      </motion.div>
      {/* Subtle animated background shapes */}
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/10 rounded-full blur-3xl z-0 animate-spin-slow"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-pink-500/20 via-indigo-500/10 to-purple-500/30 rounded-full blur-2xl z-0 animate-spin-slow"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      />
    </section>
  );
} 