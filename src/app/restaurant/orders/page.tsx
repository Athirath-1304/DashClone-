'use client'

import { useEffect, useState } from 'react'

type OrderItem = {
  qty: number
  name: string
  price: number
}

type Order = {
  id: string
  status: string
  total_price: number
  created_at: string
  items: OrderItem[]
  restaurant: { name: string }
  customer: { email: string }
}

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch('/api/orders')
        const data = await res.json()
        
        if (res.ok) {
          setOrders(data.orders)
        } else {
          console.error('API Error - Status:', res.status)
          console.error('API Error - Data:', data)
          console.error('API Error - Response headers:', Object.fromEntries(res.headers.entries()))
          setError(data.error || `Failed to load orders (Status: ${res.status})`)
        }
      } catch (err) {
        setError('Network error occurred')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrders(prev => new Set(prev).add(orderId))
      
      const res = await fetch('/api/orders/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, newStatus }),
      })

      const data = await res.json()

      if (res.ok) {
        // Refetch orders to get updated data
        const ordersRes = await fetch('/api/orders')
        const ordersData = await ordersRes.json()
        if (ordersRes.ok) {
          setOrders(ordersData.orders)
        }
      } else {
        console.error('Failed to update order status:', data.error)
        setError(data.error || 'Failed to update order status')
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      setError('Network error occurred')
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing'
      case 'preparing':
        return 'ready'
      default:
        return null
    }
  }

  const getStatusButtonText = (currentStatus: string): string => {
    switch (currentStatus) {
      case 'pending':
        return 'Start Preparing'
      case 'preparing':
        return 'Mark Ready'
      case 'ready':
        return 'Ready'
      default:
        return 'Update Status'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-orange-100 text-orange-800'
      case 'ready':
        return 'bg-purple-100 text-purple-800'
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Restaurant Orders</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Restaurant Orders</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Orders</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Orders</h1>
          <div className="text-sm text-gray-500">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ₹{order.total_price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">Customer:</span>
                      <span>{order.customer.email}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900">
                              {item.qty} × {item.name}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{(item.qty * item.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{order.total_price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status Update Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {(() => {
                      const nextStatus = getNextStatus(order.status)
                      const isUpdating = updatingOrders.has(order.id)
                      const isDisabled = !nextStatus || isUpdating
                      
                      return (
                        <button
                          onClick={() => nextStatus && updateOrderStatus(order.id, nextStatus)}
                          disabled={isDisabled}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                            isDisabled
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {isUpdating ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </div>
                          ) : (
                            getStatusButtonText(order.status)
                          )}
                        </button>
                      )
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 