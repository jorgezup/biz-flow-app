'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, Product, SaleDetail } from '@/types';
import apiUrl from '@/utils/api';
import { useLocale, useTranslations } from 'next-intl';

const CreateSalePage = () => {
  const t = useTranslations('sales');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerInput, setCustomerInput] = useState<string>('');
  const [saleDetails, setSaleDetails] = useState<SaleDetail[]>([]);
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
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

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerInput(value);

    const selectedCustomer = customers.find(customer => customer.name === value);
    if (selectedCustomer) {
      setSelectedCustomerId(selectedCustomer.customerId);
    } else {
      setSelectedCustomerId('');
    }
  };

  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.productId === productId);
    if (!product) return;

    const existingDetail = saleDetails.find((p) => p.productId === productId);
    if (existingDetail) {
      setSaleDetails(
        saleDetails.map((p) =>
          p.productId === productId ? { ...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * product.price } : p
        )
      );
    } else {
      setSaleDetails([
        ...saleDetails,
        {
          id: '',
          saleId: '',
          productId,
          quantity: 1,
          unitPrice: product.price,
          subtotal: product.price,
          createdAt: '',
          updatedAt: '',
        } as SaleDetail,
      ]);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = products.find(p => p.productId === productId);
    if (!product) return;

    setSaleDetails(
      saleDetails.map((p) =>
        p.productId === productId ? { ...p, quantity, subtotal: quantity * product.price } : p
      )
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      customerId: selectedCustomerId,
      saleDate: new Date(saleDate).toISOString(),
      saleDetails: saleDetails.map((detail) => ({
        productId: detail.productId,
        quantity: detail.quantity,
      })),
    };

    try {
      const response = await fetch(`${apiUrl}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const sale = await response.json();
        router.push(`/${locale}/sale-details/sale/${sale.id}`);
      } else {
        console.error('Failed to create sale');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">{t('createSale')}</h1>
      <div className="mb-4">
        <label className="block text-gray-700">{common('customer')}</label>
        <input
          list="customer-list"
          value={customerInput}
          onChange={handleCustomerChange}
          className="p-2 border rounded w-full"
          placeholder={common('selectCustomer')}
        />
        <datalist id="customer-list">
          {customers.map((customer) => (
            <option key={customer.customerId} value={customer.name} />
          ))}
        </datalist>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">{common('saleDate')}</label>
        <input
          type="date"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">{common('products')}</label>
        <div className="grid grid-cols-3 gap-4">
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
        {saleDetails.length === 0 ? (
          <p>{common('noProductsSelected')}</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 border-b">{common('productName')}</th>
                <th className="py-2 border-b">{common('quantity')}</th>
                <th className="py-2 border-b">{common('unitOfMeasure')}</th>
                <th className="py-2 border-b">{common('unitPrice')}</th>
                <th className="py-2 border-b">{common('subTotal')}</th>
                <th className="py-2 border-b">{common('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {saleDetails.map((detail) => {
                const product = products.find(p => p.productId === detail.productId);
                return (
                  <tr key={detail.productId}>
                    <td className="py-2 border-b">{product?.name}</td>
                    <td className="py-2 border-b">
                      <input
                        type="number"
                        value={detail.quantity}
                        onChange={(e) => handleQuantityChange(detail.productId, parseFloat(e.target.value))}
                        className="p-2 border rounded"
                      />
                    </td>
                    <td className="py-2 border-b">{product?.unitOfMeasure}</td>
                    <td className="py-2 border-b">{product?.price.toFixed(2)}</td>
                    <td className="py-2 border-b">{detail.subtotal.toFixed(2)}</td>
                    <td className="py-2 border-b">
                      <button
                        type="button"
                        onClick={() => setSaleDetails(saleDetails.filter((p) => p.productId !== detail.productId))}
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
          {t('createSale')}
        </button>
      </div>
    </div>
  );
};

export default CreateSalePage;
