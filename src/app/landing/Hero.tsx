"use client";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  return (
    <section className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white py-20 px-4 text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">DashClone</h1>
      <p className="text-xl md:text-2xl mb-8 font-medium max-w-2xl mx-auto">Powering the Future of Food Delivery</p>
      <button
        className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-indigo-50 transition"
        onClick={() => router.push("/login")}
      >
        Get Started
      </button>
    </section>
  );
} 