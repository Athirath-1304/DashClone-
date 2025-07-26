"use client";
import { Utensils, Store, Truck } from "lucide-react";

const features = [
  {
    icon: Utensils,
    title: "Real-time Orders",
    desc: "Instant order updates and live tracking for customers and restaurants."
  },
  {
    icon: Store,
    title: "Restaurant Management",
    desc: "Powerful tools for restaurant owners to manage menus, orders, and analytics."
  },
  {
    icon: Truck,
    title: "Delivery Assignment Automation",
    desc: "Smart delivery agent assignment for fast, efficient deliveries."
  }
];

export default function Features() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose DashClone?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-xl shadow p-8 flex flex-col items-center text-center hover:shadow-lg transition">
              <f.icon className="w-12 h-12 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 