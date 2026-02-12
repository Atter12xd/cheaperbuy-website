// src/stores/cartStore.ts
import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import { CartService, type CartItem } from '@/lib/supabase';

// Tipos para el estado del carrito
export interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  currency: 'PEN' | 'USD';
  isLoading: boolean;
  cartId: string | null;
}

export interface CartNotification {
  type: 'success' | 'error' | 'info';
  message: string;
  productName?: string;
  show: boolean;
}

// Estado inicial del carrito
const initialCartState: CartState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
  currency: 'PEN',
  isLoading: false,
  cartId: null
};

// Store principal del carrito
export const $cart = atom<CartState>(initialCartState);

// Store para notificaciones
export const $cartNotification = atom<CartNotification>({
  type: 'info',
  message: '',
  show: false
});

// Store para el ID de sesión (persistente)
export const $sessionId = persistentAtom<string>('archiper_cart_session', '');

// Store para el estado del drawer/modal del carrito
export const $cartDrawerOpen = atom<boolean>(false);

// Funciones para manejar el carrito
export const cartActions = {
  
  // Inicializar carrito
  async initialize() {
    const currentState = $cart.get();
    if (currentState.isLoading) return;

    $cart.set({ ...currentState, isLoading: true });

    try {
      let sessionId = $sessionId.get();
      
      // Generar sessionId si no existe
      if (!sessionId) {
        sessionId = `archiper_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        $sessionId.set(sessionId);
      }

      // Obtener o crear carrito
      const cart = await CartService.getOrCreateCart(sessionId);
      
      if (cart) {
        $cart.set({
          items: cart.cart_items || [],
          totalAmount: cart.total_amount,
          itemCount: cart.item_count,
          currency: cart.currency as 'PEN' | 'USD',
          isLoading: false,
          cartId: cart.id
        });
      } else {
        $cart.set({ ...initialCartState, isLoading: false });
      }

    } catch (error) {
      console.error('Error initializing cart:', error);
      $cart.set({ ...initialCartState, isLoading: false });
      this.showNotification('error', 'Error al cargar el carrito');
    }
  },

  // Agregar producto al carrito
  async addProduct(productId: string, quantity: number = 1, productName?: string, options?: any) {
    const currentState = $cart.get();
    
    if (!currentState.cartId) {
      await this.initialize();
    }

    const cartId = $cart.get().cartId;
    if (!cartId) {
      this.showNotification('error', 'Error al acceder al carrito');
      return false;
    }

    $cart.set({ ...currentState, isLoading: true });

    try {
      const success = await CartService.addToCart(cartId, productId, quantity, options);
      
      if (success) {
        // Recargar carrito para obtener datos actualizados
        await this.refreshCart();
        
        this.showNotification(
          'success', 
          `${productName || 'Producto'} agregado al carrito`,
          productName
        );
        
        // Abrir drawer del carrito brevemente
        $cartDrawerOpen.set(true);
        
        return true;
      } else {
        this.showNotification('error', 'No se pudo agregar el producto');
        return false;
      }

    } catch (error) {
      console.error('Error adding product:', error);
      this.showNotification('error', 'Error al agregar producto');
      return false;
    } finally {
      const state = $cart.get();
      $cart.set({ ...state, isLoading: false });
    }
  },

  // Actualizar cantidad de un producto
  async updateQuantity(productId: string, newQuantity: number) {
    const currentState = $cart.get();
    if (!currentState.cartId) return false;

    $cart.set({ ...currentState, isLoading: true });

    try {
      const success = await CartService.updateQuantity(
        currentState.cartId, 
        productId, 
        newQuantity
      );
      
      if (success) {
        await this.refreshCart();
        return true;
      }
      
      return false;

    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showNotification('error', 'Error al actualizar cantidad');
      return false;
    } finally {
      const state = $cart.get();
      $cart.set({ ...state, isLoading: false });
    }
  },

  // Remover producto del carrito
  async removeProduct(productId: string, productName?: string) {
    const currentState = $cart.get();
    if (!currentState.cartId) return false;

    $cart.set({ ...currentState, isLoading: true });

    try {
      const success = await CartService.removeFromCart(currentState.cartId, productId);
      
      if (success) {
        await this.refreshCart();
        this.showNotification(
          'info', 
          `${productName || 'Producto'} removido del carrito`
        );
        return true;
      }
      
      return false;

    } catch (error) {
      console.error('Error removing product:', error);
      this.showNotification('error', 'Error al remover producto');
      return false;
    } finally {
      const state = $cart.get();
      $cart.set({ ...state, isLoading: false });
    }
  },

  // Refrescar carrito desde la base de datos
  async refreshCart() {
    const currentState = $cart.get();
    if (!currentState.cartId) return;

    try {
      const sessionId = $sessionId.get();
      const cart = await CartService.getOrCreateCart(sessionId);
      
      if (cart) {
        $cart.set({
          ...currentState,
          items: cart.cart_items || [],
          totalAmount: cart.total_amount,
          itemCount: cart.item_count,
          isLoading: false
        });
      }

    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  },

  // Limpiar carrito completamente
  async clearCart() {
    const currentState = $cart.get();
    if (!currentState.cartId) return;

    try {
      // Eliminar todos los items del carrito
      for (const item of currentState.items) {
        await CartService.removeFromCart(currentState.cartId, item.product_id);
      }
      
      $cart.set({
        ...initialCartState,
        cartId: currentState.cartId
      });
      
      this.showNotification('info', 'Carrito vaciado');

    } catch (error) {
      console.error('Error clearing cart:', error);
      this.showNotification('error', 'Error al vaciar carrito');
    }
  },

  // Cambiar moneda
  switchCurrency(currency: 'PEN' | 'USD') {
    const currentState = $cart.get();
    $cart.set({ ...currentState, currency });
    
    // Aquí podrías agregar lógica para convertir precios
    this.showNotification('info', `Moneda cambiada a ${currency}`);
  },

  // Obtener cantidad de un producto específico en el carrito
  getProductQuantity(productId: string): number {
    const currentState = $cart.get();
    const item = currentState.items.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  },

  // Verificar si un producto está en el carrito
  isProductInCart(productId: string): boolean {
    return this.getProductQuantity(productId) > 0;
  },

  // Obtener total en formato de moneda
  getFormattedTotal(): string {
    const currentState = $cart.get();
    const { totalAmount, currency } = currentState;
    
    if (currency === 'USD') {
      return `$${(totalAmount / 3.8).toFixed(2)} USD`; // Conversión aproximada
    }
    
    return `S/. ${totalAmount.toFixed(2)}`;
  },

  // Mostrar notificación
  showNotification(type: 'success' | 'error' | 'info', message: string, productName?: string) {
    $cartNotification.set({
      type,
      message,
      productName,
      show: true
    });

    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      $cartNotification.set({
        type: 'info',
        message: '',
        show: false
      });
    }, 3000);
  },

  // Ocultar notificación
  hideNotification() {
    $cartNotification.set({
      type: 'info',
      message: '',
      show: false
    });
  },

  // Controlar drawer del carrito
  openCartDrawer() {
    $cartDrawerOpen.set(true);
  },

  closeCartDrawer() {
    $cartDrawerOpen.set(false);
  },

  toggleCartDrawer() {
    const isOpen = $cartDrawerOpen.get();
    $cartDrawerOpen.set(!isOpen);
  }
};

// Funciones de utilidad
export const cartUtils = {
  
  // Calcular subtotal sin impuestos
  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.total_price, 0);
  },

  // Calcular IGV (18%)
  calculateTax(subtotal: number): number {
    return subtotal * 0.18;
  },

  // Calcular costo de envío
  calculateShipping(subtotal: number): number {
    // Envío gratis para compras mayores a S/500
    return subtotal >= 500 ? 0 : 25;
  },

  // Calcular total final
  calculateTotal(subtotal: number): number {
    const tax = this.calculateTax(subtotal);
    const shipping = this.calculateShipping(subtotal);
    return subtotal + tax + shipping;
  },

  // Formatear precio según moneda
  formatPrice(amount: number, currency: 'PEN' | 'USD' = 'PEN'): string {
    if (currency === 'USD') {
      return `$${(amount / 3.8).toFixed(2)} USD`;
    }
    return `S/. ${amount.toFixed(2)}`;
  },

  // Obtener datos para checkout
  getCheckoutData() {
    const currentState = $cart.get();
    const subtotal = this.calculateSubtotal(currentState.items);
    const tax = this.calculateTax(subtotal);
    const shipping = this.calculateShipping(subtotal);
    const total = subtotal + tax + shipping;

    return {
      items: currentState.items,
      subtotal,
      tax,
      shipping,
      total,
      currency: currentState.currency,
      itemCount: currentState.itemCount
    };
  }
};

// Inicializar carrito cuando se carga el store
if (typeof window !== 'undefined') {
  // Solo en el cliente
  cartActions.initialize();
}