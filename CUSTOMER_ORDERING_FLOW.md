# Customer Ordering Flow - DashClone

A complete customer ordering system built with Next.js 14, Supabase, and Tailwind CSS.

## 🚀 Features

### 1. Restaurant Browsing (`/restaurants`)
- **Filtered Display**: Shows only approved and open restaurants
- **Rich Cards**: Restaurant name, cuisine type, delivery time, delivery fee
- **Responsive Grid**: Adapts to different screen sizes
- **Quick Access**: "View Menu" button for each restaurant

### 2. Menu Viewing (`/restaurant/[id]`)
- **Restaurant Details**: Header with restaurant info and delivery details
- **Menu Items**: Grid of available dishes with images and descriptions
- **Quantity Controls**: Add/remove items directly from menu cards
- **Real-time Cart**: Floating cart button with item count and total

### 3. Global Cart System
- **Zustand Store**: Persistent cart state across pages
- **Quantity Management**: Add, remove, update quantities
- **Restaurant Validation**: Ensures all items are from same restaurant
- **Floating Cart Button**: Shows item count and total price

### 4. Checkout Process (`/checkout`)
- **Order Summary**: Clear display of all items and totals
- **Delivery Notes**: Optional special instructions
- **Validation**: Ensures user is logged in and cart is valid
- **Order Placement**: Creates order in Supabase with proper structure

### 5. Order Tracking (`/dashboard/customer`)
- **Order History**: Complete list of customer's orders
- **Status Tracking**: Visual status badges with color coding
- **Real-time Updates**: Live updates when order status changes
- **Order Details**: Full order information with items and notes

### 6. Order Confirmation (`/order-confirmation`)
- **Success Page**: Confirmation with order details
- **Next Steps**: Clear explanation of delivery process
- **Navigation**: Links to track order or order more food

## 🛠 Technical Implementation

### Database Schema

#### Restaurants Table
```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  is_approved BOOLEAN NOT NULL DEFAULT true,
  is_open BOOLEAN DEFAULT true,
  cuisine_type VARCHAR(100),
  delivery_time INTEGER DEFAULT 30,
  delivery_fee DECIMAL(10,2) DEFAULT 0.00,
  minimum_order DECIMAL(10,2) DEFAULT 0.00,
  image_url TEXT,
  -- ... other fields
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  items JSONB NOT NULL, -- Array of order items
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- ... other fields
);
```

### Row Level Security (RLS) Policies

```sql
-- Customers can only insert orders with their own customer_id
CREATE POLICY "Customers can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Customers can view their own orders
CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Restaurant owners can view/update orders for their restaurants
CREATE POLICY "Restaurant owners can view orders for their restaurants" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = orders.restaurant_id 
      AND restaurants.owner_id = auth.uid()
    )
  );
```

### State Management

#### Cart Store (Zustand)
```typescript
interface CartState {
  items: CartItem[];
  total: number;
  addItem: (dish: Dish) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}
```

### Key Components

1. **DishCard**: Menu item with quantity controls
2. **CartButton**: Floating cart with count and total
3. **Restaurant Cards**: Restaurant browsing interface
4. **Order Tracking**: Customer dashboard with order history

## 🔄 User Flow

1. **Browse Restaurants** → Customer visits `/restaurants`
2. **Select Restaurant** → Clicks "View Menu" on restaurant card
3. **Add Items** → Uses quantity controls on dish cards
4. **Review Cart** → Floating cart button shows current items
5. **Checkout** → Clicks cart button to go to `/checkout`
6. **Place Order** → Reviews order and submits
7. **Confirmation** → Redirected to order confirmation page
8. **Track Order** → Can view order status in customer dashboard

## 🎨 UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback
- **Status Badges**: Color-coded order status indicators
- **Real-time Updates**: Live order status changes

## 🔒 Security Features

- **Authentication Required**: Users must be logged in to order
- **RLS Policies**: Database-level security
- **Input Validation**: Client and server-side validation
- **Role-based Access**: Different permissions for different user types

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create Supabase project
   - Run the SQL migrations
   - Set environment variables

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test the Flow**
   - Create a customer account
   - Browse restaurants
   - Add items to cart
   - Complete checkout process

## 📱 Mobile Optimization

- Touch-friendly buttons and controls
- Responsive grid layouts
- Optimized images with Next.js Image component
- Mobile-first design approach

## 🔧 Customization

- **Styling**: Modify Tailwind classes for different themes
- **Features**: Add delivery address, payment methods, etc.
- **Validation**: Customize order validation rules
- **Notifications**: Integrate push notifications for order updates

This customer ordering flow provides a complete, production-ready food delivery experience with modern web technologies and best practices. 