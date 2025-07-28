-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for customers to insert their own orders
CREATE POLICY "Customers can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Policy for customers to view their own orders
CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Policy for restaurant owners to view orders for their restaurants
CREATE POLICY "Restaurant owners can view orders for their restaurants" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = orders.restaurant_id 
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Policy for restaurant owners to update orders for their restaurants
CREATE POLICY "Restaurant owners can update orders for their restaurants" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = orders.restaurant_id 
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Policy for delivery agents to view assigned orders
CREATE POLICY "Delivery agents can view assigned orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'delivery_agent'
    ) AND (
      orders.delivery_agent_id = auth.uid() OR 
      orders.status IN ('ACCEPTED', 'PICKED_UP')
    )
  );

-- Policy for delivery agents to update assigned orders
CREATE POLICY "Delivery agents can update assigned orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'delivery_agent'
    ) AND orders.delivery_agent_id = auth.uid()
  );

-- Policy for admins to view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy for users to insert their own profile (during signup)
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy for admins to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Enable RLS on restaurants table
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to restaurants (anyone can view restaurants)
CREATE POLICY "Public can view restaurants" ON restaurants
  FOR SELECT USING (true);

-- Policy for restaurant owners to manage their restaurants
CREATE POLICY "Restaurant owners can manage their restaurants" ON restaurants
  FOR ALL USING (auth.uid() = owner_id);

-- Policy for admins to manage all restaurants
CREATE POLICY "Admins can manage all restaurants" ON restaurants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Enable RLS on menu_items table
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to menu items (anyone can view menu items)
CREATE POLICY "Public can view menu items" ON menu_items
  FOR SELECT USING (true);

-- Policy for restaurant owners to manage their menu items
CREATE POLICY "Restaurant owners can manage their menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menu_items.restaurant_id 
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Policy for admins to manage all menu items
CREATE POLICY "Admins can manage all menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  ); 