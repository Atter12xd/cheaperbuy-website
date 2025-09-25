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

interface CheckoutData {
  customerType: 'individual' | 'business';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  taxId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  sameAsBilling: boolean;
  shippingAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
  };
  notes: string;
  paymentMethod: string;
}

const CheckoutForm: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutData>({
    customerType: 'individual',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    taxId: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'PE',
    sameAsBilling: true,
    shippingAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: ''
    },
    notes: '',
    paymentMethod: 'bank_transfer'
  });

  // Cargar items del carrito
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const sessionId = localStorage.getItem('archiper_cart_session');
      if (!sessionId) {
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      const { data: cart } = await supabase
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

      if (cart?.cart_items) {
        setCartItems(cart.cart_items);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal >= 500 ? 0 : 25;
  const total = subtotal + tax + shipping;

  const formatPrice = (amount: number): string => {
    return `S/. ${amount.toFixed(2)}`;
  };

  const getProduct = (item: CartItem) => {
    if (Array.isArray(item.product)) {
      return item.product[0] || { name: 'Producto', sku: '' };
    }
    return item.product || { name: 'Producto', sku: '' };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('shipping.')) {
      const shippingField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [shippingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const generateOrderNumber = (): string => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `ARCH${year}${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    if (!formData.paymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear orden en Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: generateOrderNumber(),
          customer_email: formData.email,
          customer_phone: formData.phone,
          subtotal,
          tax_amount: tax,
          shipping_amount: shipping,
          total_amount: total,
          billing_address: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            companyName: formData.companyName,
            taxId: formData.taxId,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country
          },
          shipping_address: formData.sameAsBilling ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country
          } : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            ...formData.shippingAddress,
            country: formData.country
          },
          notes: formData.notes,
          currency: 'PEN',
          status: 'pending',
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear items de la orden
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_sku: getProduct(item).sku,
        product_name: getProduct(item).name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product_options: {}
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpiar carrito
      const sessionId = localStorage.getItem('archiper_cart_session');
      if (sessionId) {
        const { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('session_id', sessionId)
          .single();

        if (cart) {
          await supabase.from('cart_items').delete().eq('cart_id', cart.id);
          await supabase.from('carts').delete().eq('id', cart.id);
        }
      }

      // Redirigir a página de confirmación
      window.location.href = `/order-confirmation?order=${order.order_number}`;

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al procesar la orden. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-primary-100 dark:bg-primary-700 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-primary-400 dark:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-100 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-primary-600 dark:text-primary-400 mb-6">
          Agrega algunos productos antes de proceder al checkout
        </p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-wood-600 text-white rounded-lg hover:bg-wood-700 transition-colors"
        >
          Continuar Comprando
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Formulario Principal */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Tipo de Cliente */}
        <div className="bg-white dark:bg-primary-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100 mb-4">
            Tipo de Cliente
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <label className={`
              cursor-pointer p-4 border-2 rounded-lg transition-all
              ${formData.customerType === 'individual' 
                ? 'border-wood-600 bg-wood-50 dark:bg-wood-900/20' 
                : 'border-primary-300 dark:border-primary-600'
              }
            `}>
              <input
                type="radio"
                name="customerType"
                value="individual"
                checked={formData.customerType === 'individual'}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-primary-800 dark:text-primary-100">
                  Persona Natural
                </span>
              </div>
            </label>
            
            <label className={`
              cursor-pointer p-4 border-2 rounded-lg transition-all
              ${formData.customerType === 'business' 
                ? 'border-wood-600 bg-wood-50 dark:bg-wood-900/20' 
                : 'border-primary-300 dark:border-primary-600'
              }
            `}>
              <input
                type="radio"
                name="customerType"
                value="business"
                checked={formData.customerType === 'business'}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-medium text-primary-800 dark:text-primary-100">
                  Empresa
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Información Personal */}
        <div className="bg-white dark:bg-primary-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100 mb-4">
            Información Personal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
              />
            </div>
            
            {formData.customerType === 'business' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required={formData.customerType === 'business'}
                    className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                    RUC *
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    required={formData.customerType === 'business'}
                    className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dirección de Facturación */}
        <div className="bg-white dark:bg-primary-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100 mb-4">
            Dirección de Facturación
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Referencia (opcional)
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Departamento *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="bg-white dark:bg-primary-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100 mb-4">
            Método de Pago
          </h2>
          
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-primary-300 dark:border-primary-600 rounded-lg cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={formData.paymentMethod === 'bank_transfer'}
                onChange={handleInputChange}
                className="text-wood-600 focus:ring-wood-500"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-primary-800 dark:text-primary-100">
                  Transferencia Bancaria
                </div>
                <div className="text-sm text-primary-600 dark:text-primary-400">
                  BCP - Cuenta Soles: 570 7899 0114 047
                </div>
              </div>
            </label>
            
            <label className="flex items-center p-4 border border-primary-300 dark:border-primary-600 rounded-lg cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={formData.paymentMethod === 'paypal'}
                onChange={handleInputChange}
                className="text-wood-600 focus:ring-wood-500"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-primary-800 dark:text-primary-100">
                  PayPal
                </div>
                <div className="text-sm text-primary-600 dark:text-primary-400">
                  Pago seguro con PayPal (USD)
                </div>
              </div>
            </label>
            
            <label className="flex items-center p-4 border border-primary-300 dark:border-primary-600 rounded-lg cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-700 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={formData.paymentMethod === 'credit_card'}
                onChange={handleInputChange}
                className="text-wood-600 focus:ring-wood-500"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-primary-800 dark:text-primary-100">
                  Tarjeta de Crédito/Débito
                </div>
                <div className="text-sm text-primary-600 dark:text-primary-400">
                  Visa, Mastercard, American Express
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Notas adicionales */}
        <div className="bg-white dark:bg-primary-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100 mb-4">
            Notas Adicionales
          </h2>
          
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            placeholder="Instrucciones especiales para la entrega, horarios preferidos, etc."
            className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-wood-500 bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-100"
          />
        </div>
      </div>

      {/* Resumen de la Orden */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-primary-800 rounded-lg shadow-lg p-6 sticky top-8">
          <h2 className="text-xl font-bold text-primary-800 dark:text-primary-100 mb-4">
            Resumen de la Orden
          </h2>
          
          {/* Items del carrito */}
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-700 rounded-lg flex-shrink-0">
                  <img 
                    src="/images/p1-1.jpeg" 
                    alt={getProduct(item).name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-primary-800 dark:text-primary-100 truncate">
                    {getProduct(item).name}
                  </h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400">
                    Cantidad: {item.quantity}
                  </p>
                  <p className="text-sm font-medium text-primary-800 dark:text-primary-100">
                    {formatPrice(item.total_price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Totales */}
          <div className="border-t border-primary-200 dark:border-primary-700 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-primary-600 dark:text-primary-400">Subtotal:</span>
              <span className="font-medium text-primary-800 dark:text-primary-100">
                {formatPrice(subtotal)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-primary-600 dark:text-primary-400">IGV (18%):</span>
              <span className="font-medium text-primary-800 dark:text-primary-100">
                {formatPrice(tax)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-primary-600 dark:text-primary-400">Envío:</span>
              <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-primary-800 dark:text-primary-100'}`}>
                {shipping === 0 ? 'GRATIS' : formatPrice(shipping)}
              </span>
            </div>
            
            <div className="flex justify-between text-lg font-bold border-t border-primary-200 dark:border-primary-700 pt-3">
              <span className="text-primary-800 dark:text-primary-100">Total:</span>
              <span className="text-wood-600 dark:text-wood-400">
                {formatPrice(total)}
              </span>
            </div>
          </div>
          
          {/* Botón de finalizar compra */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-gradient-to-r from-wood-600 to-wood-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-wood-700 hover:to-wood-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
           {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Procesando...
              </div>
            ) : (
              'Finalizar Compra'
            )}
          </button>
          
          {/* Información de seguridad */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-primary-600 dark:text-primary-400">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span>Transacción 100% segura</span>
            </div>
          </div>
          
          {/* Información de contacto */}
          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-700 rounded-lg">
            <h3 className="text-sm font-medium text-primary-800 dark:text-primary-100 mb-2">
              ¿Necesitas ayuda?
            </h3>
            <div className="text-sm text-primary-600 dark:text-primary-400 space-y-1">
              <p>📞 Llámanos: +51 975 733 744</p>
              <p>📧 Email: AntonioGutierrez@archipierbuildersupply.com</p>
              <p>🕒 Lun-Vie: 8AM-6PM | Sáb: 8AM-2PM</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;