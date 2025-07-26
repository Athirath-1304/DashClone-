"use client";

export default function Footer() {
  return (
    <footer className="w-full py-6 bg-gray-100 border-t mt-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-2 text-gray-600 text-sm">
        <div className="font-bold text-indigo-600">DashClone</div>
        <nav className="flex flex-wrap gap-4">
          <a href="#" className="hover:text-indigo-500 transition">About</a>
          <a href="#" className="hover:text-indigo-500 transition">Terms</a>
          <a href="https://github.com/athirathbommerla/dashclone" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition">GitHub</a>
          <a href="#" className="hover:text-indigo-500 transition">Contact</a>
        </nav>
        <div className="text-xs text-gray-400">&copy; {new Date().getFullYear()} DashClone</div>
      </div>
    </footer>
  );
} 