"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { toast } from "sonner";

interface Delivery {
  id: string;
  order_id: string;
  status: string;
  created_at: string;
  order: {
    restaurant_id: string;
    items: Array<{ id: string; name: string; price: number; quantity: number; image_url: string }>;
    total_price: number;
    restaurant: { name: string };
  };
}

export default function DeliveryDashboard() {
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    async function fetchDeliveries() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }
      // Fetch deliveries for this agent, including order and restaurant info
      const { data: deliveryData } = await supabase
        .from("deliveries")
        .select(`id, order_id, status, created_at, order:order_id (restaurant_id, items, total_price, restaurant:restaurant_id (name))`)
        .eq("delivery_agent_id", userData.user.id)
        .order("created_at", { ascending: false });
      // Fix: flatten order if returned as array
      const fixedDeliveries = (deliveryData || []).map((d: any) => ({
        ...d,
        order: Array.isArray(d.order) ? d.order[0] : d.order,
      }));
      setDeliveries(fixedDeliveries);
      setLoading(false);

      // Realtime subscription
      const channel = supabase.channel("deliveries-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "deliveries", filter: `delivery_agent_id=eq.${userData.user.id}` },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setDeliveries((prev) => [payload.new, ...prev]);
              toast.success("New delivery assigned!");
            } else if (payload.eventType === "UPDATE") {
              setDeliveries((prev) =>
                prev.map((d) =>
                  d.id === payload.new.id
                    ? ({
                        ...d,
                        ...payload.new,
                        order: payload.new.order ?? d.order,
                        status: payload.new.status ?? d.status,
                        created_at: payload.new.created_at ?? d.created_at,
                      } as Delivery)
                    : d
                )
              );
              if (payload.new.status !== payload.old.status) {
                toast.info(`Delivery status updated: ${payload.new.status}`);
              }
            }
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
    fetchDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("deliveries").update({ status: newStatus }).eq("id", deliveryId);
    if (error) {
      toast.error("Failed to update delivery status");
      return;
    }
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, status: newStatus } : d))
    );
    toast.success(`Delivery marked as '${newStatus}'`);
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

  const statusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-gray-300 text-gray-800";
      case "picked_up":
        return "bg-blue-500 text-white";
      case "delivered":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, Delivery Agent</h1>
      <h2 className="text-lg font-semibold mb-2">Assigned Deliveries</h2>
      {deliveries.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No deliveries assigned.</div>
      ) : (
        <div className="space-y-6">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Delivery #{delivery.id.slice(-6)}</div>
                <div className="text-xs text-gray-500">Assigned {timeAgo(delivery.created_at)}</div>
              </div>
              <div className="mb-2">
                <div className="font-medium mb-1">Restaurant: {delivery.order?.restaurant?.name || "-"}</div>
                {delivery.order?.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm mb-1">
                    <img src={item.image_url} alt={item.name} className="w-8 h-8 object-cover rounded" />
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500">× {item.quantity}</span>
                    <span className="ml-auto">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <span className="font-semibold">Total: </span>
                  <span>${delivery.order?.total_price?.toFixed(2) || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium mr-2 ${statusColor(delivery.status)}`}>{delivery.status}</span>
                  {delivery.status === "assigned" && (
                    <button
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      onClick={() => updateDeliveryStatus(delivery.id, "picked_up")}
                    >
                      Picked Up
                    </button>
                  )}
                  {delivery.status === "picked_up" && (
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      onClick={() => updateDeliveryStatus(delivery.id, "delivered")}
                    >
                      Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 