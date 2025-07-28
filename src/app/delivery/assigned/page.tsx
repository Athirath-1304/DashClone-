'use client'

import { useEffect, useState } from 'react'

type Order = {
  id: string
  status: string
  total_price: number
  created_at: string
  items: { name: string; qty: number; price: number }[]
  restaurant: { name: string }
  customer: { email: string }
}

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (res.ok) setOrders(data.orders)
      else console.error(data.error || 'Failed to load orders')
      setLoading(false)
    }

    fetchOrders()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assigned Deliveries</h1>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No assigned orders yet.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-xl p-4 shadow">
              <p><strong>Restaurant:</strong> {order.restaurant.name}</p>
              <p><strong>Customer:</strong> {order.customer.email}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Items:</strong></p>
              <ul className="ml-4 list-disc">
                {order.items.map((item, i) => (
                  <li key={i}>{item.qty} × {item.name} — ₹{item.price}</li>
                ))}
              </ul>
              <p className="mt-2 font-semibold">Total: ₹{order.total_price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 