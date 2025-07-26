export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'restaurant' | 'admin' | 'delivery';
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine_type: string;
  rating: number;
  delivery_time: number;
  minimum_order: number;
  delivery_fee: number;
  image_url?: string;
  is_open: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  delivery_person_id?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address: string;
  delivery_instructions?: string;
  payment_method: 'cash' | 'card' | 'online';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  price: number;
  special_instructions?: string;
  created_at: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  special_instructions?: string;
}

export interface DeliveryPerson {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  is_available: boolean;
  current_location?: {
    lat: number;
    lng: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  restaurant_id: string;
  order_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Stats {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  total_restaurants: number;
  total_delivery_persons: number;
  orders_today: number;
  revenue_today: number;
  orders_this_month: number;
  revenue_this_month: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  query?: string;
  cuisine_type?: string;
  min_price?: number;
  max_price?: number;
  rating?: number;
  delivery_time?: number;
  is_open?: boolean;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
} 