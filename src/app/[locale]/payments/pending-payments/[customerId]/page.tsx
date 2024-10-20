'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import apiUrl from '@/utils/api';
import { Customer, Order, PaymentMethod } from '@/types';
import formatCurrency from '@/utils/currency';
import { format } from 'date-fns';
import PaymentModal from '@/app/components/PaymentModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSave, FiCheckCircle } from 'react-icons/fi';
import { useParams, useRouter } from 'next/navigation';

const CustomerPendingPaymentsPage = () => {
  const t = useTranslations('payments');
  const common = useTranslations('common');
  const locale = useLocale();
  const { customerId } = useParams();

  const router = useRouter();

  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [productSummary, setProductSummary] = useState<{
    [key: string]: { totalQuantity: number; totalAmount: number };
  }>({});
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<string | null>(null);

  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState<{ [orderId: string]: string }>({});

  // State for date filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // State for "Pay All Orders" modal
  const [isPayAllModalOpen, setIsPayAllModalOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().substr(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchCustomerName = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/customers/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }
      const data: Customer = await response.json();
      setCustomer(data.name);
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  }, [customerId]);

  // Use useCallback to memorize the function so it doesn't change between renders
  const fetchPendingPayments = useCallback(async () => {
    try {
      setLoading(true);
      let query = `${apiUrl}/payments/pending-payments?customerId=${customerId}`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;

      const response = await fetch(query);
      if (!response.ok) throw new Error('Failed to fetch pending payments');

      const result = await response.json();
      setOrders(result.orders);

      // Calculate product summary and total amount
      const summary: {
        [key: string]: { totalQuantity: number; totalAmount: number };
      } = {};
      let total = 0;

      result.orders.forEach((order: Order) => {
        total += order.totalAmount;

        // Verifique se os arrays `products`, `quantity` e `subtotal` existem e são válidos.
        if (Array.isArray(order.products) && Array.isArray(order.quantity) && Array.isArray(order.subtotal)) {
          order.products.forEach((product, index) => {
            const quantity = order.quantity[index];
            const subtotal = order.subtotal[index];

            // Verifique se os valores de quantity e subtotal são válidos antes de acessar
            if (typeof quantity === 'number' && typeof subtotal === 'number') {
              if (summary[product]) {
                summary[product].totalQuantity += quantity;
                summary[product].totalAmount += subtotal;
              } else {
                summary[product] = {
                  totalQuantity: quantity,
                  totalAmount: subtotal,
                };
              }
            }
          });
        }
      });
      setProductSummary(summary);
      setTotalAmount(total);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [customerId, startDate, endDate]);


  useEffect(() => {
    fetchCustomerName();
    fetchPendingPayments();
  }, [fetchPendingPayments, fetchCustomerName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">{common('loading')}</div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // Handlers for individual payments
  const handlePaymentMethodChange = (orderId: string, method: string) => {
    setPaymentMethods((prevMethods) => ({
      ...prevMethods,
      [orderId]: method,
    }));
  };

  const registerPayment = async (orderId: string) => {
    const paymentMethod = paymentMethods[orderId];

    if (!paymentMethod) {
      toast.info(t('selectPaymentMethod'));
      return;
    }

    const paymentData = {
      orderId,
      paymentMethod,
      paymentDate: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${apiUrl}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register payment');
      }

      toast.success(t('paymentRegistered'));

      // Update the status of the specific order to "Paid" without refreshing all data
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, paid: true } : order
        )
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Handlers for "Pay All Orders" modal
  const openPayAllModal = () => {
    fetchPendingPayments();
    setIsPayAllModalOpen(true);
  };

  const closePayAllModal = () => {
    setIsPayAllModalOpen(false);
  };

  const handlePayAllOrders = async () => {
    try {
      setIsProcessing(true);
  
      // Array para armazenar IDs de pedidos pagos com sucesso
      const paidOrderIds: string[] = [];
  
      for (const order of orders) {
        const paymentData = {
          orderId: order.id,
          paymentMethod: paymentMethod,
          paymentDate: paymentDate,
        };
  
        const response = await fetch(`${apiUrl}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to register payment');
        }
  
        // Adicione o ID do pedido pago ao array
        paidOrderIds.push(order.id);
      }
  
      // Atualize o estado de todas as ordens que foram pagas
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          paidOrderIds.includes(order.id) ? { ...order, paid: true } : order
        )
      );
  
      toast.success(t('paymentsRegistered'));
      closePayAllModal();
  
      // Redirecionar após um pequeno atraso
      setTimeout(() => {
        router.push(`/${locale}/payments`);
      }, 1000);
  
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
        {customer}
      </h1>

      {/* Summary Section */}
      {Object.keys(productSummary).length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 mb-6 mx-auto md:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-blue-900">{t('summary')}</h3>
            <span className="text-xl text-gray-700">
              {common('total')}: {formatCurrency(locale, totalAmount)}
            </span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-center">{t('product')}</th>
                <th className="py-3 px-4 text-center">{t('totalQuantity')}</th>
                <th className="py-3 px-4 text-center">{t('totalAmount')}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(productSummary).map(([product, data]) => (
                <tr key={product} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-4 text-center">{product}</td>
                  <td className="py-3 px-4 text-center">{data.totalQuantity}</td>
                  <td className="py-3 px-4 text-center">
                    {formatCurrency(locale, data.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed Orders Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          {/* Filters Section */}
          <div className="flex flex-col md:flex-row md:space-x-4 items-center justify-center">
            {/* Date Filters */}
            <div className="flex space-x-2 items-center">
              <label htmlFor="startDate" className="mr-2 text-center text-gray-600">{common('startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
                className="p-2 border rounded text-center text-gray-600"
              />
            </div>
            <div className="flex space-x-2 items-center">
              <label htmlFor="endDate" className="mr-2 text-center text-gray-600">{common('endDate')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                }}
                className="p-2 border rounded text-center text-gray-600"
              />
            </div>
          </div>
          <div>
            <button
              onClick={openPayAllModal}
              className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ${orders.length === 0 ? 'cursor-not-allowed opacity-50 hover:bg-green-500' : ''
                }`}
              disabled={orders.length === 0}
            >
              {t('payAllOrders')}
            </button>
          </div>
        </div>
        {orders.length === 0 ? (
          <p className="text-red-500 text-center p-8">{t('noPendingPayments')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-center">{t('orderDate')}</th>
                  <th className="py-3 px-4 text-center">{common('products')}</th>
                  <th className="py-3 px-4 text-center">{t('totalAmount')}</th>
                  <th className="py-3 px-4 text-center">{t('paymentMethod')}</th>
                  <th className="py-3 px-4 text-center">{t('status')}</th>
                  <th className="py-3 px-4 text-center">{common('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-4 text-center">
                      {format(
                        new Date(order.orderDate),
                        locale === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">{order.products.join(', ')}</td>
                    <td className="py-3 px-4 text-center">
                      {formatCurrency(locale, order.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={paymentMethods[order.id] || ''}
                        onChange={(e) => handlePaymentMethodChange(order.id, e.target.value)}
                        className="border p-1 rounded text-center"
                        disabled={order.paid} // Disable if already paid
                      >
                        <option value="">{t('selectPaymentMethod')}</option>
                        {Object.keys(PaymentMethod).map((method) => (
                          <option key={method} value={method}>
                            {t(`${method.toLowerCase()}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {order.paid ? (
                        <FiCheckCircle className="text-green-500 text-center inline" size={20} />
                      ) : (
                        <span className="text-gray-500 text-center">{t('pending')}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => registerPayment(order.id)}
                        className="text-blue-500 px-3 py-1 rounded hover:text-blue-900 transition"
                        disabled={order.paid} // Disable if already paid
                      >
                        <FiSave size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay All Orders Modal */}
      <PaymentModal
        isOpen={isPayAllModalOpen}
        onRequestClose={closePayAllModal}
        title={t('payAllOrders')}
      >
        {/* Total Amount */}
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">{t('totalAmount')}</h3>
          <span className="text-lg text-gray-700">
            {formatCurrency(locale, totalAmount)}
          </span>
        </div>
        {/* Date Selector */}
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">{t('paymentDate')}</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        {/* Payment Method Selector */}
        <div className="mb-4">
          <label className="block mb-2 text-gray-700">{t('paymentMethod')}</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border p-2 rounded w-full"
          >
            {Object.keys(PaymentMethod).map((method) => (
              <option key={method} value={method}>
                {t(`${method.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
        {/* Orders List */}
        <div className="mb-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-2 text-gray-700">{t('orderDate')}</th>
                <th className="py-2 text-gray-700">{t('amount')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2 text-center">
                    {format(
                      new Date(order.orderDate),
                      locale === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy'
                    )}
                  </td>
                  <td className="py-2 text-center">
                    {formatCurrency(locale, order.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Save Button */}
        <button
          onClick={handlePayAllOrders}
          className={`bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          disabled={isProcessing}
        >
          {isProcessing ? t('processing') : common('save')}
        </button>
      </PaymentModal>

      <ToastContainer />
    </div>
  );
};

export default CustomerPendingPaymentsPage;