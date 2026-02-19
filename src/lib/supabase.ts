// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://ymwpsjlwwvsbockcyvbt.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltd3Bzamx3d3ZzYm9ja2N5dmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjM2NDAsImV4cCI6MjA2ODkzOTY0MH0.Oz024W60h5THQhz0uWyjabNFr5I8fzk40EirB1IxE-Y';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos TypeScript para la base de datos
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price_pen: number;
  price_usd?: number;
  category: string;
  subcategory?: string;
  brand: string;
  material?: string;
  dimensions?: Record<string, any>;
  specifications?: Record<string, any>;
  features?: Record<string, any>;
  images?: string[];
  stock_quantity: number;
  weight_kg?: number;
  is_active: boolean;
  is_featured: boolean;
  warranty_years: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_options?: Record<string, any>;
  added_at: string;
  product?: Product;
}

// Tipo específico para cart item con producto incluido
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface Cart {
  id: string;
  session_id?: string;
  customer_id?: string;
  currency: string;
  total_amount: number;
  item_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  cart_items?: CartItemWithProduct[];
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  tax_id?: string;
  customer_type: 'individual' | 'business';
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_email: string;
  customer_phone?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  billing_address: Record<string, any>;
  shipping_address: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Funciones de utilidad para la base de datos
export class ProductService {
  static async getProduct(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  }

  static async getProducts(category?: string, limit?: number): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data || [];
  }

  static async getFeaturedProducts(limit = 6): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit);

    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }

    return data || [];
  }
}

export class CartService {
  static async getOrCreateCart(sessionId: string, customerId?: string): Promise<Cart | null> {
    // Primero intentar obtener carrito existente
    let query = supabase
      .from('carts')
      .select(`
        *,
        cart_items (
          *,
          product:products (*)
        )
      `);

    if (customerId) {
      query = query.eq('customer_id', customerId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data: existingCart, error: fetchError } = await query.single();

    if (!fetchError && existingCart) {
      return existingCart;
    }

    // Si no existe, crear nuevo carrito
    const newCart = {
      session_id: customerId ? null : sessionId,
      customer_id: customerId || null,
      currency: 'PEN',
      total_amount: 0,
      item_count: 0,
    };

    const { data, error } = await supabase
      .from('carts')
      .insert([newCart])
      .select()
      .single();

    if (error) {
      console.error('Error creating cart:', error);
      return null;
    }

    return { ...data, cart_items: [] };
  }

  static async addToCart(
    cartId: string, 
    productId: string, 
    quantity: number = 1,
    options?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Obtener precio del producto
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('price_pen, stock_quantity')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        console.error('Product not found:', productError);
        return false;
      }

      // Verificar stock
      if (product.stock_quantity < quantity) {
        console.error('Insufficient stock');
        return false;
      }

      // Verificar si el item ya existe en el carrito
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Actualizar cantidad existente
        const newQuantity = existingItem.quantity + quantity;
        const { error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: newQuantity,
            unit_price: product.price_pen 
          })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Error updating cart item:', error);
          return false;
        }
      } else {
        // Agregar nuevo item
        const { error } = await supabase
          .from('cart_items')
          .insert([{
            cart_id: cartId,
            product_id: productId,
            quantity,
            unit_price: product.price_pen,
            product_options: options
          }]);

        if (error) {
          console.error('Error adding cart item:', error);
          return false;
        }
      }

      // Actualizar totales del carrito
      await this.updateCartTotals(cartId);
      return true;

    } catch (error) {
      console.error('Error in addToCart:', error);
      return false;
    }
  }

  static async updateCartTotals(cartId: string): Promise<void> {
    // Calcular totales basados en los items
    const { data: items } = await supabase
      .from('cart_items')
      .select('quantity, unit_price')
      .eq('cart_id', cartId);

    if (!items) return;

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    await supabase
      .from('carts')
      .update({ 
        total_amount: totalAmount, 
        item_count: itemCount 
      })
      .eq('id', cartId);
  }

  static async removeFromCart(cartId: string, productId: string): Promise<boolean> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing cart item:', error);
      return false;
    }

    await this.updateCartTotals(cartId);
    return true;
  }

  static async updateQuantity(cartId: string, productId: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      return this.removeFromCart(cartId, productId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('cart_id', cartId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error updating quantity:', error);
      return false;
    }

    await this.updateCartTotals(cartId);
    return true;
  }
}

export class OrderService {
  static async createOrder(
    cartId: string,
    customerInfo: any,
    billingAddress: any,
    shippingAddress: any
  ): Promise<string | null> {
    try {
      // Obtener items del carrito
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            product:products (*)
          )
        `)
        .eq('id', cartId)
        .single();

      if (cartError || !cart) {
        console.error('Cart not found:', cartError);
        return null;
      }

      // Calcular totales
      const subtotal = cart.total_amount;
      const taxAmount = subtotal * 0.18; // IGV 18%
      const shippingAmount = subtotal >= 500 ? 0 : 25; // Envío gratis si es mayor a S/500
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Crear orden
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: await this.generateOrderNumber(),
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          billing_address: billingAddress,
          shipping_address: shippingAddress,
          currency: 'PEN'
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return null;
      }

      // Crear items de la orden
      const orderItems = cart.cart_items?.map((item: CartItemWithProduct) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_sku: item.product.sku,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_options: item.product_options
      })) || [];

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        return null;
      }

      // Limpiar carrito solo si hay items
      if (orderItems.length > 0) {
        await supabase.from('cart_items').delete().eq('cart_id', cartId);
        await supabase.from('carts').delete().eq('id', cartId);
      }

      return order.id;

    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  static async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { data, error } = await supabase.rpc('generate_order_number');
    
    if (error) {
      // Fallback si la función no funciona
      const timestamp = Date.now().toString().slice(-6);
      return `ARCH${year}${timestamp}`;
    }
    
    return data;
  }
}