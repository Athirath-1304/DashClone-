"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Bar } from "react-chartjs-2";
import Image from "next/image";

interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; image_url: string }>;
  total_price: number;
  status: string;
  created_at: string;
  restaurant: { name: string };
  customer: { email: string };
  deliveries?: Array<{ id: string }>;
}

interface Agent {
  id: string;
  email: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  owner: { email: string };
  created_at: string;
  is_approved: boolean;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantFilter, setRestaurantFilter] = useState<'pending' | 'approved'>('pending');
  const [approving, setApproving] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    customers: 0,
    restaurants: 0,
    orders: 0,
    deliveries: 0,
    ordersByDay: [] as { date: string; count: number }[],
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      // Check if user is admin
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const { data: userMeta } = await supabase
        .from("users")
        .select("role")
        .eq("id", userData.user.id)
        .single();
      if (!userMeta || userMeta.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      // Fetch orders ready for delivery with no delivery assigned
      const { data: orderData } = await supabase
        .from("orders")
        .select("id, customer_id, restaurant_id, items, total_price, status, created_at, restaurant:restaurant_id (name), customer:customer_id (email), deliveries(id)")
        .eq("status", "ready_for_delivery");
      // Only show orders with no delivery
      const filteredOrders = (orderData || []).filter((o: unknown) => {
        const order = o as Order;
        return !order.deliveries || order.deliveries.length === 0;
      });
      // Fix: flatten restaurant, customer, and deliveries if returned as arrays
      const fixedOrders = filteredOrders.map((o: unknown) => {
        const order = o as Order;
        return {
          ...order,
          restaurant: Array.isArray(order.restaurant) ? order.restaurant[0] : order.restaurant,
          customer: Array.isArray(order.customer) ? order.customer[0] : order.customer,
          deliveries: Array.isArray(order.deliveries) ? order.deliveries : [],
        };
      });
      setOrders(fixedOrders);
      // Fetch all delivery agents
      const { data: agentData } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("role", "delivery");
      setAgents(agentData || []);
      // Fetch restaurants for approval
      const { data: restData } = await supabase
        .from("restaurants")
        .select("id, name, description, owner:owner_id (email), created_at, is_approved")
        .order("created_at", { ascending: false });
      setRestaurants((restData || []).map((r: unknown) => {
        const restaurant = r as Restaurant;
        return {
          ...restaurant,
          owner: Array.isArray(restaurant.owner) ? restaurant.owner[0] : restaurant.owner,
        };
      }));
      // Fetch analytics counts
      const [customersRes, restaurantsRes, ordersRes, deliveriesRes, ordersByDayRes] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "customer"),
        supabase.from("restaurants").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("deliveries").select("id", { count: "exact", head: true }).eq("status", "delivered"),
        supabase.rpc("orders_by_day_last_7", {}), // custom function, see below
      ]);
      setAnalytics({
        customers: customersRes.count || 0,
        restaurants: restaurantsRes.count || 0,
        orders: ordersRes.count || 0,
        deliveries: deliveriesRes.count || 0,
        ordersByDay: ordersByDayRes.data || [],
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleAssign = async (orderId: string) => {
    const agentId = selectedAgent[orderId];
    if (!agentId) {
      toast.error("Please select a delivery agent");
      return;
    }
    setAssigning(orderId);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("deliveries").insert({
      order_id: orderId,
      delivery_agent_id: agentId,
      status: "assigned",
    });
    if (error) {
      toast.error("Failed to assign delivery");
      setAssigning(null);
      return;
    }
    toast.success("Delivery assigned successfully");
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setAssigning(null);
  };

  const handleApprove = async (restaurantId: string) => {
    setApproving(restaurantId);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("restaurants").update({ is_approved: true }).eq("id", restaurantId);
    if (error) {
      toast.error("Failed to approve restaurant");
      setApproving(null);
      return;
    }
    setRestaurants((prev) => prev.map(r => r.id === restaurantId ? { ...r, is_approved: true } : r));
    toast.success("Restaurant approved");
    setApproving(null);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
  if (!isAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-xl">Access denied.</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, Admin</h1>
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-gray-100 rounded p-4 text-center">
          <div className="text-3xl font-bold">{agents.length}</div>
          <div className="text-sm">Delivery Agents</div>
        </div>
        <div className="flex-1 bg-gray-100 rounded p-4 text-center">
          <div className="text-3xl font-bold">{orders.length}</div>
          <div className="text-sm">Orders to Assign</div>
        </div>
      </div>
      <button className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 mb-6">Approve Restaurants</button>
      <h2 className="text-lg font-semibold mb-2">Orders Ready for Delivery</h2>
      {orders.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No orders to assign.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Order #{order.id.slice(-6)}</div>
                <div className="text-xs text-gray-500">Placed {new Date(order.created_at).toLocaleString()}</div>
              </div>
              <div className="mb-2">
                <div className="font-medium mb-1">Restaurant: {order.restaurant?.name || "-"}</div>
                <div className="font-medium mb-1">Customer: {order.customer?.email || "-"}</div>
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
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={selectedAgent[order.id] || ""}
                    onChange={(e) => setSelectedAgent((prev) => ({ ...prev, [order.id]: e.target.value }))}
                  >
                    <option value="">Select agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.email}</option>
                    ))}
                  </select>
                  <button
                    className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 text-sm disabled:opacity-50"
                    onClick={() => handleAssign(order.id)}
                    disabled={assigning === order.id}
                  >
                    {assigning === order.id ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <h2 className="text-lg font-semibold mb-2">Restaurant Approvals</h2>
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${restaurantFilter === 'pending' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setRestaurantFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`px-3 py-1 rounded ${restaurantFilter === 'approved' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setRestaurantFilter('approved')}
        >
          Approved
        </button>
      </div>
      {restaurants.filter(r => restaurantFilter === 'pending' ? !r.is_approved : r.is_approved).length === 0 ? (
        <div className="text-gray-500 text-center py-8">No {restaurantFilter} restaurants.</div>
      ) : (
        <div className="space-y-6">
          {restaurants.filter(r => restaurantFilter === 'pending' ? !r.is_approved : r.is_approved).map((r) => (
            <div key={r.id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-gray-500">Created {new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="mb-2 text-gray-700">{r.description}</div>
              <div className="mb-2 text-sm text-gray-500">Owner: {r.owner?.email || '-'}</div>
              {!r.is_approved && (
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                  onClick={() => handleApprove(r.id)}
                  disabled={approving === r.id}
                >
                  {approving === r.id ? 'Approving...' : 'Approve'}
                </button>
              )}
              {r.is_approved && (
                <span className="text-xs px-2 py-1 rounded bg-green-200 text-green-800 font-medium">Approved</span>
              )}
            </div>
          ))}
        </div>
      )}
      <h2 className="text-lg font-semibold mb-2">Platform Analytics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center animate-fade-up">
          <div className="text-3xl mb-2">👤</div>
          <div className="text-lg font-bold">{analytics.customers}</div>
          <div className="text-xs text-gray-500">Customers</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-3xl mb-2">🏬</div>
          <div className="text-lg font-bold">{analytics.restaurants}</div>
          <div className="text-xs text-gray-500">Restaurants</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-3xl mb-2">📦</div>
          <div className="text-lg font-bold">{analytics.orders}</div>
          <div className="text-xs text-gray-500">Orders</div>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-3xl mb-2">🚚</div>
          <div className="text-lg font-bold">{analytics.deliveries}</div>
          <div className="text-xs text-gray-500">Deliveries</div>
        </div>
      </div>
      {/* Bonus: Mini bar chart for orders in last 7 days */}
      {analytics.ordersByDay.length > 0 && (
        <div className="bg-white rounded shadow p-4 mb-8">
          <div className="font-semibold mb-2">Orders (Last 7 Days)</div>
          <Bar
            data={{
              labels: analytics.ordersByDay.map((d) => d.date),
              datasets: [
                {
                  label: "Orders",
                  data: analytics.ordersByDay.map((d) => d.count),
                  backgroundColor: "#6366f1",
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { display: false } } },
              responsive: true,
              maintainAspectRatio: false,
            }}
            height={120}
          />
        </div>
      )}
    </div>
  );
}

/*
-- SQL for orders_by_day_last_7 function (run in Supabase SQL editor):
create or replace function orders_by_day_last_7()
returns table(date text, count integer)
language sql
as $$
  select to_char(created_at::date, 'Mon DD') as date, count(*)
  from orders
  where created_at >= (current_date - interval '6 days')
  group by created_at::date
  order by created_at::date;
$$;
*/

/*
Add this to your global CSS for fade-in animation:
@keyframes fade-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
.animate-fade-in {
  animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
}
*/ 