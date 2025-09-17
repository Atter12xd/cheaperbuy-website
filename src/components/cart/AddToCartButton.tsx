import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, $cartNotification, cartActions } from '@/stores/cartStore';

interface AddToCartButtonProps {
  productId?: string;
  productName?: string;
  productPrice?: number;
  productSlug?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId = 'arch-alu-001', // ID por defecto de la Puerta Elite Moderna
  productName = 'Puerta Elite Moderna de Aluminio',
  productPrice = 2850.00,
  productSlug = 'puerta-elite-moderna',
  className = '',
  size = 'lg',
  variant = 'primary'
}) => {
  const cart = useStore($cart);
  const notification = useStore($cartNotification);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Verificar si el producto ya está en el carrito
  const productInCart = cart.items.find(item => item.product_id === productId);
  const currentQuantity = productInCart ? productInCart.quantity : 0;

  // Configuración de estilos según el tamaño
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  // Configuración de estilos según la variante
  const variantClasses = {
    primary: `bg-gradient-to-r from-wood-600 to-wood-700 hover:from-wood-700 hover:to-wood-800 
             text-white shadow-lg hover:shadow-xl border border-wood-600`,
    secondary: `bg-primary-600 hover:bg-primary-700 text-white border border-primary-600`,
    outline: `border-2 border-wood-600 text-wood-600 hover:bg-wood-600 hover:text-white 
             bg-transparent`
  };

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);
    
    try {
      const success = await cartActions.addProduct(
        productId,
        1, // cantidad por defecto
        productName,
        { 
          slug: productSlug,
          price: productPrice 
        }
      );

      if (success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    
    if (newQuantity === 0) {
      await cartActions.removeProduct(productId, productName);
    } else {
      await cartActions.updateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="relative">
      {/* Botón principal */}
      {currentQuantity === 0 ? (
        <button
          onClick={handleAddToCart}
          disabled={isAdding || cart.isLoading}
          className={`
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${className}
            relative overflow-hidden font-semibold rounded-lg
            transform transition-all duration-200 hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            focus:outline-none focus:ring-4 focus:ring-wood-300 dark:focus:ring-wood-800
          `}
        >
          {/* Loader spinner */}
          {isAdding && (
            <div className="absolute inset-0 flex items-center justify-center bg-inherit">
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          
          {/* Icono del carrito */}
          <div className={`flex items-center justify-center gap-3 ${isAdding ? 'opacity-0' : 'opacity-100'}`}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
            AGREGAR AL CARRITO
          </div>

          {/* Efecto de éxito */}
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-600 text-white">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              ¡AGREGADO!
            </div>
          )}
        </button>
      ) : (
        // Controles de cantidad cuando ya está en el carrito
        <div className="flex items-center gap-3 bg-white dark:bg-primary-800 border border-primary-300 dark:border-primary-600 rounded-lg p-2">
          <span className="text-sm text-primary-600 dark:text-primary-300 font-medium">
            En carrito:
          </span>
          
          <div className="flex items-center gap-2">
            {/* Botón decrementar */}
            <button
              onClick={() => handleUpdateQuantity(currentQuantity - 1)}
              disabled={cart.isLoading}
              className="w-8 h-8 flex items-center justify-center bg-primary-100 dark:bg-primary-700 
                       text-primary-600 dark:text-primary-300 rounded-full hover:bg-primary-200 
                       dark:hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Cantidad actual */}
            <span className="w-8 text-center font-semibold text-primary-800 dark:text-primary-100">
              {currentQuantity}
            </span>

            {/* Botón incrementar */}
            <button
              onClick={() => handleUpdateQuantity(currentQuantity + 1)}
              disabled={cart.isLoading}
              className="w-8 h-8 flex items-center justify-center bg-wood-100 dark:bg-wood-800 
                       text-wood-600 dark:text-wood-300 rounded-full hover:bg-wood-200 
                       dark:hover:bg-wood-700 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

          {/* Botón para ver carrito */}
          <button
            onClick={() => cartActions.openCartDrawer()}
            className="ml-2 px-3 py-1 bg-wood-600 text-white text-sm rounded-md hover:bg-wood-700 
                     transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
            Ver
          </button>
        </div>
      )}

      {/* Precio del producto */}
      <div className="mt-3 text-center">
        <span className="text-2xl font-bold text-wood-600 dark:text-wood-400">
          S/. {productPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
        </span>
        <div className="text-sm text-primary-500 dark:text-primary-400 mt-1">
          Aprox. ${(productPrice / 3.8).toFixed(2)} USD
        </div>
      </div>

      {/* Información de envío */}
      <div className="mt-4 text-center">
        {productPrice >= 500 ? (
          <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Envío GRATIS
          </div>
        ) : (
          <div className="text-primary-600 dark:text-primary-400 text-sm">
            Envío: S/. 25.00 | 
            <span className="text-green-600 dark:text-green-400 font-medium ml-1">
              GRATIS desde S/. 500
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToCartButton;