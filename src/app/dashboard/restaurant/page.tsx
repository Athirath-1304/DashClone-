"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { toast } from "sonner";
import Image from 'next/image';

interface Order {
  id: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; image_url: string }>;
  total_price: number;
  status: string;
  created_at: string;
}

export default function RestaurantDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }
      // Get restaurant owned by this user
      const { data: restData } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", userData.user.id)
        .single();
      if (!restData) {
        setLoading(false);
        return;
      }
      // Fetch orders for this restaurant
      const { data: orderData } = await supabase
        .from("orders")
        .select("id, items, total_price, status, created_at")
        .eq("restaurant_id", restData.id)
        .order("created_at", { ascending: false });
      setOrders(orderData || []);
      setLoading(false);

      // Realtime subscription
      const channel = supabase.channel("orders-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restData.id}` },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setOrders((prev) => [payload.new as Order, ...prev]);
              toast.success("New order received!");
            } else if (payload.eventType === "UPDATE") {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === payload.new.id
                    ? ({
                        ...o,
                        ...payload.new,
                        items: payload.new.items ?? o.items,
                        total_price: payload.new.total_price ?? o.total_price,
                        status: payload.new.status ?? o.status,
                        created_at: payload.new.created_at ?? o.created_at,
                      } as Order)
                    : o
                )
              );
              if (payload.new.status !== payload.old.status) {
                toast.info(`Order status updated: ${payload.new.status}`);
              }
            }
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast.error("Failed to update order status");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    toast.success(`Order marked as '${status}'`);
  };

  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes
    if (diff < 1) return "just now";
    if (diff === 1) return "1 minute ago";
    if (diff < 60) return `${diff} minutes ago`;
    const hours = Math.floor(diff / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, Restaurant Owner</h1>
      <button className="mb-6 px-4 py-2 bg-black text-white rounded hover:bg-gray-800">Add Menu Item</button>
      <div>
        <h2 className="text-lg font-semibold mb-2">Active Orders</h2>
        {orders.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No orders yet.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded shadow p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Order #{order.id.slice(-6)}</div>
                  <div className="text-xs text-gray-500">Placed {timeAgo(order.created_at)}</div>
                </div>
                <div className="mb-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm mb-1">
                      <Image src={item.image_url} alt={item.name} width={32} height={32} className="w-8 h-8 object-cover rounded" />
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500">× {item.quantity}</span>
                      <span className="ml-auto">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <span className="font-semibold">Total: </span>
                    <span>${order.total_price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-gray-200 font-medium mr-2">{order.status}</span>
                    {order.status === "pending" && (
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        onClick={() => updateOrderStatus(order.id, "accepted")}
                      >
                        Accept
                      </button>
                    )}
                    {order.status === "accepted" && (
                      <button
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                      >
                        Prepare
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button
                        className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                        onClick={() => updateOrderStatus(order.id, "ready_for_delivery")}
                      >
                        Ready for Delivery
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 