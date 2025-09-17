import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    name: string;
    sku: string;
  } | {
    name: string;
    sku: string;
  }[];
}

const FloatingCartButton: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);

  // Obtener items del carrito directamente de Supabase
  const fetchCartItems = async () => {
  try {
    let sessionId = localStorage.getItem('archiper_cart_session');
    
    if (!sessionId) {
      sessionId = `archiper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('archiper_cart_session', sessionId);
    }

    console.log('🔍 Buscando carrito con session_id:', sessionId); // ADD THIS

    const { data: cart, error } = await supabase  // ADD error
      .from('carts')
      .select(`
        id,
        cart_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          product:products (
            name,
            sku
          )
        )
      `)
      .eq('session_id', sessionId)
      .single();

    console.log('📦 Respuesta de Supabase:', { cart, error }); // ADD THIS
    console.log('🛒 Cart items encontrados:', cart?.cart_items?.length || 0); // ADD THIS

    if (cart?.cart_items) {
      setCartItems(cart.cart_items);
      setCartId(cart.id);
    } else {
      setCartItems([]);
    }
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    setCartItems([]);
  } finally {
    setIsLoading(false);
  }
};

  // Actualizar cantidad
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!cartId) return;

    try {
      if (newQuantity <= 0) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cartId)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('cart_id', cartId)
          .eq('product_id', productId);
      }

      // Actualizar totales del carrito
      await updateCartTotals();
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Eliminar producto
  const removeProduct = async (productId: string) => {
    if (!cartId) return;

    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
        .eq('product_id', productId);

      await updateCartTotals();
      await fetchCartItems();
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  // Actualizar totales del carrito
  const updateCartTotals = async () => {
    if (!cartId) return;

    try {
      const { data: items } = await supabase
        .from('cart_items')
        .select('quantity, unit_price')
        .eq('cart_id', cartId);

      if (items) {
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
    } catch (error) {
      console.error('Error updating cart totals:', error);
    }
  };

  useEffect(() => {
    fetchCartItems();
    
    // Actualizar cada 10 segundos
    const interval = setInterval(fetchCartItems, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + tax + shipping;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Helper function para obtener el producto
  const formatPrice = (amount: number): string => {
    return `S/. ${amount.toFixed(2)}`;
  };

 // Helper function para obtener el producto
  const getProduct = (item: CartItem) => {
    if (Array.isArray(item.product)) {
      return item.product[0] || { name: 'Producto', sku: '' };
    }
    return item.product || { name: 'Producto', sku: '' };
  };

  // Cerrar drawer con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  console.log('🎯 Estado final:', {
  isLoading,
  totalItems,
  cartItemsLength: cartItems.length,
  cartId
});

  if (isLoading || totalItems === 0) return null;

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-6 right-6 z-50 
          w-16 h-16 bg-gradient-to-r from-wood-600 to-wood-700 
          text-white rounded-full shadow-2xl 
          hover:from-wood-700 hover:to-wood-800 
          transform transition-all duration-300 hover:scale-110
          focus:outline-none focus:ring-4 focus:ring-wood-300
          ${isOpen ? 'scale-95' : 'hover:animate-pulse'}
        `}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
          </svg>
          
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        </div>
      </button>

      {/* Overlay del Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mini Carrito Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-primary-800 
        shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header del Drawer */}
        <div className="flex items-center justify-between p-6 border-b border-primary-200 dark:border-primary-700">
          <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100">
            Mi Carrito ({totalItems})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-primary-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del Carrito */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg className="w-16 h-16 text-primary-400 dark:text-primary-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-primary-600 dark:text-primary-400">Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-primary-50 dark:bg-primary-700 rounded-lg">
                  {/* Imagen del producto */}
                  <div className="w-16 h-16 bg-primary-200 dark:bg-primary-600 rounded-lg flex-shrink-0">
                    <img 
                      src="/images/p1-1.jpeg" 
                      alt={getProduct(item).name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary-800 dark:text-primary-100 truncate">
                      {getProduct(item).name}
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {formatPrice(item.unit_price)}
                    </p>
                    
                    {/* Controles de cantidad */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-primary-200 dark:bg-primary-600 rounded-full hover:bg-primary-300 dark:hover:bg-primary-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                      
                      <span className="w-8 text-center font-medium text-primary-800 dark:text-primary-100">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-primary-200 dark:bg-primary-600 rounded-full hover:bg-primary-300 dark:hover:bg-primary-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeProduct(item.product_id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Resumen del Carrito */}
            <div className="border-t border-primary-200 dark:border-primary-700 p-6 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-primary-600 dark:text-primary-400">Subtotal:</span>
                <span className="font-medium text-primary-800 dark:text-primary-100">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* IGV */}
              <div className="flex justify-between text-sm">
                <span className="text-primary-600 dark:text-primary-400">IGV (18%):</span>
                <span className="font-medium text-primary-800 dark:text-primary-100">
                  {formatPrice(tax)}
                </span>
              </div>

              {/* Envío */}
              <div className="flex justify-between text-sm">
                <span className="text-primary-600 dark:text-primary-400">Envío:</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-primary-800 dark:text-primary-100'}`}>
                  {shipping === 0 ? 'GRATIS' : formatPrice(shipping)}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold border-t border-primary-200 dark:border-primary-700 pt-4">
                <span className="text-primary-800 dark:text-primary-100">Total:</span>
                <span className="text-wood-600 dark:text-wood-400">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <button 
                  className="w-full bg-gradient-to-r from-wood-600 to-wood-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-wood-700 hover:to-wood-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    console.log('Ir al checkout');
                    // Aquí irá la navegación al checkout
                  }}
                >
                  Proceder al Pago
                </button>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full border-2 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300 py-3 px-6 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>

              {/* Envío gratis info */}
              {subtotal < 500 && (
                <div className="text-center text-sm text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-700 p-3 rounded-lg">
                  Agrega {formatPrice(500 - subtotal)} más para envío gratis
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FloatingCartButton;