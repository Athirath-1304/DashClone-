"use client";

export default function Footer() {
  return (
    <footer className="w-full py-8 bg-[#0f172a] border-t border-white/10 mt-12">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-slate-400 text-sm">
        <div className="font-extrabold text-xl text-white tracking-tight mb-2">DashClone</div>
        <nav className="flex flex-wrap gap-6 justify-center mb-2">
          <a href="#" className="hover:text-indigo-400 transition">About</a>
          <a href="https://github.com/athirathbommerla/dashclone" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">GitHub</a>
          <a href="#" className="hover:text-indigo-400 transition">Terms</a>
          <a href="#" className="hover:text-indigo-400 transition">Contact</a>
        </nav>
        <div className="text-xs text-slate-600">&copy; {new Date().getFullYear()} DashClone. All rights reserved.</div>
      </div>
    </footer>
  );
} 