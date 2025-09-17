import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $cartDrawerOpen, cartActions, cartUtils } from '@/stores/cartStore';

const FloatingCartButton: React.FC = () => {
  const cart = useStore($cart);
  const isDrawerOpen = useStore($cartDrawerOpen);
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar el botón solo si hay items en el carrito
  useEffect(() => {
    setIsVisible(cart.itemCount > 0);
  }, [cart.itemCount]);

  // Cerrar drawer con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        cartActions.closeCartDrawer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen]);

  const checkoutData = cartUtils.getCheckoutData();

  if (!isVisible) return null;

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => cartActions.toggleCartDrawer()}
        className={`
          fixed bottom-6 right-6 z-50 
          w-16 h-16 bg-gradient-to-r from-wood-600 to-wood-700 
          text-white rounded-full shadow-2xl 
          hover:from-wood-700 hover:to-wood-800 
          transform transition-all duration-300 hover:scale-110
          focus:outline-none focus:ring-4 focus:ring-wood-300
          ${isDrawerOpen ? 'scale-95' : 'hover:animate-pulse'}
        `}
      >
        {/* Icono del carrito */}
        <div className="relative flex items-center justify-center w-full h-full">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
          </svg>
          
          {/* Badge con cantidad */}
          {cart.itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {cart.itemCount > 99 ? '99+' : cart.itemCount}
            </span>
          )}
        </div>
      </button>

      {/* Overlay del Drawer */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => cartActions.closeCartDrawer()}
        />
      )}

      {/* Mini Carrito Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-primary-800 
        shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header del Drawer */}
        <div className="flex items-center justify-between p-6 border-b border-primary-200 dark:border-primary-700">
          <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100">
            Mi Carrito ({cart.itemCount})
          </h2>
          <button
            onClick={() => cartActions.closeCartDrawer()}
            className="p-2 hover:bg-primary-100 dark:hover:bg-primary-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del Carrito */}
        {cart.items.length === 0 ? (
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
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-primary-50 dark:bg-primary-700 rounded-lg">
                  {/* Imagen del producto */}
                  <div className="w-16 h-16 bg-primary-200 dark:bg-primary-600 rounded-lg flex-shrink-0">
                    <img 
                      src="/images/p1-1.jpeg" 
                      alt={item.product?.name || 'Producto'}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary-800 dark:text-primary-100 truncate">
                      {item.product?.name || 'Producto'}
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {cartUtils.formatPrice(item.unit_price)}
                    </p>
                    
                    {/* Controles de cantidad */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => cartActions.updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={cart.isLoading}
                        className="w-8 h-8 flex items-center justify-center bg-primary-200 dark:bg-primary-600 rounded-full hover:bg-primary-300 dark:hover:bg-primary-500 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                      
                      <span className="w-8 text-center font-medium text-primary-800 dark:text-primary-100">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => cartActions.updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={cart.isLoading}
                        className="w-8 h-8 flex items-center justify-center bg-primary-200 dark:bg-primary-600 rounded-full hover:bg-primary-300 dark:hover:bg-primary-500 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => cartActions.removeProduct(item.product_id, item.product?.name)}
                    disabled={cart.isLoading}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
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
                  {cartUtils.formatPrice(checkoutData.subtotal)}
                </span>
              </div>

              {/* IGV */}
              <div className="flex justify-between text-sm">
                <span className="text-primary-600 dark:text-primary-400">IGV (18%):</span>
                <span className="font-medium text-primary-800 dark:text-primary-100">
                  {cartUtils.formatPrice(checkoutData.tax)}
                </span>
              </div>

              {/* Envío */}
              <div className="flex justify-between text-sm">
                <span className="text-primary-600 dark:text-primary-400">Envío:</span>
                <span className={`font-medium ${checkoutData.shipping === 0 ? 'text-green-600' : 'text-primary-800 dark:text-primary-100'}`}>
                  {checkoutData.shipping === 0 ? 'GRATIS' : cartUtils.formatPrice(checkoutData.shipping)}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold border-t border-primary-200 dark:border-primary-700 pt-4">
                <span className="text-primary-800 dark:text-primary-100">Total:</span>
                <span className="text-wood-600 dark:text-wood-400">
                  {cartUtils.formatPrice(checkoutData.total)}
                </span>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3">
                <button 
                  className="w-full bg-gradient-to-r from-wood-600 to-wood-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-wood-700 hover:to-wood-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    // Aquí irá la navegación al checkout
                    console.log('Ir al checkout');
                  }}
                >
                  Proceder al Pago
                </button>
                
                <button 
                  onClick={() => cartActions.closeCartDrawer()}
                  className="w-full border-2 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300 py-3 px-6 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors"
                >
                  Continuar Comprando
                </button>
              </div>

              {/* Envío gratis info */}
              {checkoutData.subtotal < 500 && (
                <div className="text-center text-sm text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-700 p-3 rounded-lg">
                  Agrega {cartUtils.formatPrice(500 - checkoutData.subtotal)} más para envío gratis
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