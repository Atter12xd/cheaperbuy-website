import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sessionId, productId, quantity, productOptions } = await request.json();

    // Obtener o crear carrito
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    let cartId = cart?.id;

    if (!cartId) {
      const { data: newCart } = await supabase
        .from('carts')
        .insert([{ session_id: sessionId }])
        .select('id')
        .single();
      cartId = newCart?.id;
    }

    // Obtener precio del producto
    const { data: product } = await supabase
      .from('products')
      .select('price_pen')
      .eq('sku', productId)
      .single();

    const unitPrice = product?.price_pen || 2850;

    // Agregar item al carrito
    await supabase
      .from('cart_items')
      .upsert({
        cart_id: cartId,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        product_options: productOptions
      });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error adding to cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};