'use client'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { toast } from 'sonner'

interface Restaurant {
  id: string
  name: string
  description: string
  image_url?: string
}

export default function NewOrderPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [items, setItems] = useState([
    { name: 'Paneer Wrap', qty: 2, price: 120 },
    { name: 'Veg Pizza', qty: 1, price: 250 },
  ])

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, description, image_url')
        .limit(10)

      if (error) {
        console.error('Error fetching restaurants:', error)
        return
      }

      setRestaurants(data || [])
      if (data && data.length > 0) {
        setSelectedRestaurant(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  const handleOrder = async () => {
    if (!selectedRestaurant) {
      setStatus('Please select a restaurant')
      return
    }

    if (items.length === 0) {
      setStatus('Please add at least one item')
      return
    }

    setLoading(true)
    setStatus('')

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: selectedRestaurant,
          items: items,
        }),
      })

      const data = await res.json()
      
      if (res.ok) {
        setStatus(data.message)
        toast.success('Order placed successfully!')
        // Reset form
        setItems([
          { name: 'Paneer Wrap', qty: 2, price: 120 },
          { name: 'Veg Pizza', qty: 1, price: 250 },
        ])
      } else {
        setStatus(data.error || 'Failed to place order')
        toast.error(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      setStatus('An error occurred while placing the order')
      toast.error('An error occurred while placing the order')
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setItems([...items, { name: '', qty: 1, price: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: 'name' | 'qty' | 'price', value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.qty), 0)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Place New Order</h1>
      
      {/* Restaurant Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Restaurant
        </label>
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a restaurant...</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Order Items</h2>
          <button
            onClick={addItem}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Item
          </button>
        </div>
        
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  min="1"
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="w-20 text-right">
                <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handleOrder}
        disabled={loading || !selectedRestaurant || items.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
      >
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>

      {/* Status Message */}
      {status && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-blue-800">{status}</p>
        </div>
      )}
    </div>
  )
} 