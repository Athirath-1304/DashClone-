"use client";
import { motion } from "framer-motion";
import { Radar, Flashlight, Send, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Radar,
    title: "Real-time Order Tracking",
    desc: "Track every order live with instant updates for customers, restaurants, and delivery agents."
  },
  {
    icon: Flashlight,
    title: "Lightning-fast Restaurant Management",
    desc: "Manage menus, orders, and analytics with a blazing fast, intuitive dashboard."
  },
  {
    icon: Send,
    title: "Smart Delivery Assignment",
    desc: "AI-powered assignment ensures the fastest, most efficient deliveries every time."
  },
  {
    icon: BarChart3,
    title: "Admin Analytics Dashboard",
    desc: "Get actionable insights and beautiful reports in real time."
  }
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 px-4 bg-gradient-to-b from-[#181c2a] via-[#181a2b] to-[#1e193a]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-14 tracking-tight">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Next-Gen Features</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: "easeOut" }}
              whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(99,102,241,0.25)" }}
              className="relative bg-white/10 backdrop-blur-xl rounded-2xl border-2 border-transparent hover:border-indigo-500/60 transition-all shadow-xl p-8 flex flex-col items-center text-center group overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none z-0 rounded-2xl group-hover:shadow-[0_0_40px_10px_rgba(99,102,241,0.15)] transition" />
              <f.icon className="w-12 h-12 text-indigo-400 mb-4 drop-shadow-lg" />
              <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">{f.title}</h3>
              <p className="text-slate-300 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 