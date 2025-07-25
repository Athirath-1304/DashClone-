"use client";
import { useCart } from "@/store/cart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      toast.error("Could not place order: not logged in");
      setLoading(false);
      return;
    }
    const customer_id = userData.user.id;
    const restaurant_id = items[0]?.restaurant_id || null;
    if (!restaurant_id) {
      toast.error("Could not place order: missing restaurant");
      setLoading(false);
      return;
    }
    // Prepare order data
    const order = {
      customer_id,
      restaurant_id,
      items: items.map(({ id, name, price, quantity, image_url }) => ({ id, name, price, quantity, image_url })),
      total_price: total,
      status: "pending",
    };
    // Insert order
    const { error } = await supabase.from("orders").insert(order);
    if (error) {
      toast.error("Could not place order: " + error.message);
      setLoading(false);
      return;
    }
    toast.success("Order placed successfully");
    setOrderPlaced(true);
    clearCart();
    setLoading(false);
    setTimeout(() => {
      router.push("/dashboard/customer");
    }, 2000);
  };

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrderPlaced(true); // Assuming setOrderPlaced is the correct state to update
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
  }, []);

  if (orderPlaced) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <div className="text-2xl font-bold mb-2">Order Placed!</div>
          <div className="text-gray-600 mb-4">Thank you for your order.</div>
          <div className="animate-pulse text-4xl">🎉</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full pb-32">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        {items.length === 0 ? (
          <div className="text-gray-500 text-center py-16">Your cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-white rounded shadow p-3 gap-4"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{item.name}</div>
                  <div className="text-gray-500 text-sm">${item.price.toFixed(2)} × {item.quantity}</div>
                </div>
                <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Sticky place order bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between z-20 max-w-2xl mx-auto w-full">
          <div className="mb-2 sm:mb-0">
            <span className="font-semibold text-lg">Total: </span>
            <span className="text-xl font-bold">${total.toFixed(2)}</span>
          </div>
          <button
            className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded hover:bg-gray-800 font-semibold transition mt-2 sm:mt-0 disabled:opacity-50"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );
} 