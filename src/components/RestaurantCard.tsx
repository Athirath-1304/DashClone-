"use client";
import { useRouter } from "next/navigation";

interface RestaurantCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function RestaurantCard({ id, name, description, imageUrl }: RestaurantCardProps) {
  const router = useRouter();
  return (
    <div
      className="bg-white rounded shadow hover:shadow-lg cursor-pointer transition flex flex-col"
      onClick={() => router.push(`/restaurant/${id}`)}
    >
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-40 object-cover rounded-t"
      />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-1">{name}</h3>
        <p className="text-gray-600 text-sm flex-1">{description}</p>
      </div>
    </div>
  );
} 