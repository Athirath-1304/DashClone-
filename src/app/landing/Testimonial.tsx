"use client";

export default function Testimonial() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <blockquote className="text-2xl italic font-semibold text-gray-800 mb-6">“DashClone transformed our restaurant’s delivery business. Orders are up, and our customers love the real-time updates!”</blockquote>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-indigo-200 flex items-center justify-center text-2xl font-bold text-indigo-700 mb-2">JD</div>
          <div className="font-medium text-gray-700">Jane Doe</div>
          <div className="text-gray-400 text-sm">Owner, Demo Restaurant</div>
        </div>
      </div>
    </section>
  );
} 