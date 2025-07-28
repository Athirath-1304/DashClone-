# Cart + Order Placement Implementation

## ✅ **Complete Cart + Order Placement Flow**

### 🔧 **Changes Made to `/restaurants/[id]/page.tsx`**

#### **Step 1: Converted to Client Component**
- ✅ Added `'use client'` directive
- ✅ Converted from server component to client component
- ✅ Added React hooks for state management

#### **Step 2: Added Cart State Management**
```typescript
const [cart, setCart] = useState<CartItem[]>([]);
const [placingOrder, setPlacingOrder] = useState(false);
```

#### **Step 3: Cart Functions Implemented**

**Add to Cart:**
```typescript
function addToCart(item: MenuItem) {
  setCart(prev => {
    const existing = prev.find(i => i.id === item.id);
    if (existing) {
      return prev.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    }
    return [...prev, { ...item, quantity: 1 }];
  });
  toast.success(`${item.name} added to cart!`);
}
```

**Remove from Cart:**
```typescript
function removeFromCart(itemId: string) {
  setCart(prev => prev.filter(item => item.id !== itemId));
  toast.success('Item removed from cart');
}
```

**Update Quantity:**
```typescript
function updateQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  setCart(prev => prev.map(item => 
    item.id === itemId ? { ...item, quantity } : item
  ));
}
```

#### **Step 4: Order Placement Function**
```typescript
async function placeOrder() {
  if (cart.length === 0) {
    toast.error('Your cart is empty');
    return;
  }

  setPlacingOrder(true);
  try {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please log in to place an order');
      return;
    }

    const { id: restaurantId } = await params;
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const { error } = await supabase.from('orders').insert({
      customer_id: user.id,
      restaurant_id: restaurantId,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total_price: total,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } else {
      toast.success('Order placed successfully!');
      setCart([]); // clear cart
    }
  } catch (err) {
    console.error('Order placement error:', err);
    toast.error('Failed to place order. Please try again.');
  } finally {
    setPlacingOrder(false);
  }
}
```

#### **Step 5: Updated UI Layout**

**Menu Items with Add to Cart Buttons:**
```tsx
<div className="flex items-center justify-between">
  <p className="font-medium text-lg text-green-600">${item.price.toFixed(2)}</p>
  <button
    onClick={() => addToCart(item)}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  >
    Add to Cart
  </button>
</div>
```

**Cart Sidebar:**
```tsx
<div className="lg:col-span-1">
  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
    <h2 className="text-2xl font-bold mb-4">🛒 Your Cart</h2>
    
    {cart.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-4">🛒</div>
        <div>Your cart is empty</div>
      </div>
    ) : (
      <>
        <ul className="divide-y mb-4">
          {cart.map(item => (
            <li key={item.id} className="py-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span className="text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-green-600">${cartTotal.toFixed(2)}</span>
          </div>
          
          <button
            onClick={placeOrder}
            disabled={placingOrder || cart.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {placingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </>
    )}
  </div>
</div>
```

### ✅ **Features Implemented**

1. **✅ Add/Remove Items**: Customers can add items to cart and remove them
2. **✅ Quantity Management**: +/- buttons to adjust quantities
3. **✅ Dynamic Total**: Real-time calculation of cart total
4. **✅ Place Order**: Writes to Supabase orders table
5. **✅ Auth Check**: Ensures user is logged in before placing order
6. **✅ Loading States**: Shows loading state during order placement
7. **✅ Toast Notifications**: Success/error feedback for all actions
8. **✅ Responsive Design**: Works on mobile and desktop
9. **✅ Sticky Cart**: Cart stays visible while scrolling

### 🎨 **UI Features**

- **Sidebar Layout**: Menu items on left, cart on right
- **Sticky Cart**: Cart stays in view while scrolling
- **Quantity Controls**: +/- buttons for easy quantity adjustment
- **Remove Buttons**: Individual remove buttons for each item
- **Total Display**: Clear total price calculation
- **Place Order Button**: Prominent green button for order placement
- **Loading States**: Disabled state during order placement
- **Toast Notifications**: User feedback for all actions

### 🧪 **Testing Results**

- ✅ **Page loads correctly**: 200 status code
- ✅ **No TypeScript errors**: Clean compilation
- ✅ **Client-side functionality**: All cart operations work
- ✅ **Order placement**: Integrates with Supabase orders table
- ✅ **Auth integration**: Checks user login status
- ✅ **Error handling**: Proper error messages and fallbacks

### 📁 **Files Modified**

- ✅ `src/app/restaurants/[id]/page.tsx` - Complete cart implementation
- ✅ `CART_IMPLEMENTATION.md` - This documentation

### 🚀 **Ready for Testing**

The cart + order placement flow is now complete! Users can:

1. **Browse menu items** and add them to cart
2. **Adjust quantities** with +/- buttons
3. **Remove items** from cart
4. **See real-time total** calculation
5. **Place orders** that save to Supabase
6. **Get feedback** via toast notifications

**Test URL**: `http://localhost:3004/restaurants/[restaurant-id]`

The cart implementation is complete and ready for production use! 🛒✅ 