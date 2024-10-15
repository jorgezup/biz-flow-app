'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, Product, OrderDetail } from '@/types';
import apiUrl from '@/utils/api';
import { useLocale, useTranslations } from 'next-intl';
import formatCurrency from '@/utils/currency';
import CustomerSelect from '@/app/components/CustomerSelect';

const CreateOrderPage = () => {
  const t = useTranslations('orders');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCustomersAndProducts = async () => {
      try {
        const customersResponse = await fetch(`${apiUrl}/customers`);
        const productsResponse = await fetch(`${apiUrl}/products`);
        const customersData: Customer[] = await customersResponse.json();
        const productsData: Product[] = await productsResponse.json();
        setCustomers(customersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch customers or products:', error);
      }
    };

    fetchCustomersAndProducts();
  }, []);

  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.productId === productId);
    if (!product) return;

    const existingDetail = orderDetails.find((p) => p.productId === productId);
    if (existingDetail) {
      setOrderDetails(
        orderDetails.map((p) =>
          p.productId === productId ? { ...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * product.price } : p
        )
      );
    } else {
      setOrderDetails([
        ...orderDetails,
        {
          id: '',
          orderId: '',
          productId,
          quantity: 1,
          unitPrice: product.price,
          subtotal: product.price,
          createdAt: '',
          updatedAt: '',
        } as OrderDetail,
      ]);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = products.find(p => p.productId === productId);
    if (!product) return;

    setOrderDetails(
      orderDetails.map((p) =>
        p.productId === productId ? { ...p, quantity, subtotal: quantity * product.price } : p
      )
    );
  };

  const handleSubTotal = (productId: string, subtotal: number) => {
    const product = products.find(p => p.productId === productId);
    if (!product) return;

    setOrderDetails(
      orderDetails.map((p) =>
        p.productId === productId ? { ...p, subtotal, quantity: subtotal / product.price } : p
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert('Por favor, selecione um cliente.');
      return;
    }

    setLoading(true);
    const payload = {
      customerId: selectedCustomer.customerId,
      orderDate: new Date(orderDate).toISOString().split('T')[0],
      orderDetails: orderDetails.map((detail) => ({
        productId: detail.productId,
        quantity: detail.quantity,
      })),
    };

    try {
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(`/${locale}/orders`);
      } else {
        console.error('Failed to create order');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">{t('createOrder')}</h1>
      <div className="mb-4">
        <label className="block text-gray-700">{common('customer')}</label>
        <div className="w-1/2">
          <CustomerSelect
            customers={customers}
            value={selectedCustomer}
            onChange={(customer) => {
              setSelectedCustomer(customer);
              // setCurrentPage(1); // Resetar para a primeira página ao mudar o cliente
            }}
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">{t('orderDate')}</label>
        <input
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          className="p-2 border rounded w-1/4"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">{common('products')}</label>
        <div className="grid grid-cols-5 gap-2">
          {products.map((product) => (
            <div key={product.productId} className="flex items-center">
              <button
                type="button"
                onClick={() => handleAddProduct(product.productId)}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
              >
                {product.name}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-bold">{common('selectedProducts')}</h3>
        {orderDetails.length === 0 ? (
          <p>{common('noProductsSelected')}</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-2 border-b text-center">{common('productName')}</th>
                <th className="py-2 px-2 border-b text-center">{common('quantity')}</th>
                <th className="py-2 px-2 border-b text-center">{common('unitOfMeasure')}</th>
                <th className="py-2 px-2 border-b text-center">{common('unitPrice')}</th>
                <th className="py-2 px-2 border-b text-center">{common('subTotal')}</th>
                <th className="py-2 px-2 border-b text-center">{common('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((detail) => {
                const product = products.find(p => p.productId === detail.productId);
                return (
                  product &&
                  <tr key={detail.productId}>
                    <td className="py-2 px-2 border-b text-center">{product.name}</td>
                    <td className="py-2 px-2 border-b text-center">
                      <input
                        type="number"
                        value={detail.quantity}
                        onChange={(e) => handleQuantityChange(detail.productId, parseFloat(e.target.value))}
                        className="p-2 border rounded w-20"
                      />
                    </td>
                    <td className="py-2 px-2 border-b text-center">{common(`${product.unitOfMeasure}`)}</td>
                    <td className="py-2 px-2 border-b text-center">{formatCurrency(locale, product.price)}</td>
                    <td className="py-2 px-2 border-b text-center">
                      <input
                        type="number"
                        value={detail.subtotal}
                        onChange={(e) => handleSubTotal(detail.productId, parseFloat(e.target.value))}
                        className="p-2 border rounded w-20"
                      />
                    </td>
                    <td className="py-2 px-2 border-b text-center">
                      <button
                        type="button"
                        onClick={() => setOrderDetails(orderDetails.filter((p) => p.productId !== detail.productId))}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
                      >
                        {common('delete')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className={`bg-green-500 text-white p-2 rounded hover:bg-green-700 ${loading ? 'opacity-50' : ''}`}
          disabled={loading}
        >
          {common('save')}
        </button>
      </div>
    </div>
  );
};

export default CreateOrderPage;