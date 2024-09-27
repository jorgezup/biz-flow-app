'use client';

import { useEffect, useState } from 'react';
import { Customer, CustomerPreferences, Product } from '@/types';
import apiUrl from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocale, useTranslations } from 'next-intl';
import PreferenceForm from '@/app/components/PreferenceForm';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CustomerDetailPage = ({ params }: { params: { id: string } }) => {
  const customerId = params.id;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [preferences, setPreferences] = useState<CustomerPreferences[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [editPreferenceId, setEditPreferenceId] = useState<string | null>(null);
  const [editPreference, setEditPreference] = useState<CustomerPreferences | null>(null);
  const router = useRouter();

  const locale = useLocale();
  const t = useTranslations('customers');
  const m = useTranslations('messages');
  const c = useTranslations('common');
  const cp = useTranslations('customerPreferences');
  const days = useTranslations('days');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`${apiUrl}/customers/${customerId}`);
        const data: Customer = await response.json();
        setCustomer(data);
      } catch (error) {
        console.error('Failed to fetch customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch(`${apiUrl}/customer-preferences/${customerId}/customer`);
        const data: CustomerPreferences[] = await response.json();
        setPreferences(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setLoadingPreferences(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/products`);
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchPreferences();
    fetchProducts();
  }, [customerId]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${apiUrl}/customers/${customerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      toast.success(c('successDelete'));
      setTimeout(() => {
        router.push(`/${locale}/customers`);
      }, 1000);
    } catch (error) {
      toast.error(c('errorDelete'));
      console.error('Error deleting customer:', error);
    }
  };

  const handleEditPreference = async (preferenceId: string) => {
    setEditPreferenceId(preferenceId);
    const preference = preferences.find(p => p.id === preferenceId);
    if (preference) {
      setEditPreference(preference);
    }
  };

  const handleDeletePreference = async (preferenceId: string) => {
    try {
      const response = await fetch(`${apiUrl}/customer-preferences/${preferenceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete preference');
      }
      toast.success(c('successDelete'));
      setPreferences(preferences.filter(p => p.id !== preferenceId));
    } catch (error) {
      toast.error(c('errorDelete'));
      console.error('Error deleting preference:', error);
    }
  };

  const handleSubmitPreference = async (formData: {
    productId: string;
    preferredPurchaseDay: string;
    quantity: number;
  }) => {
    const { productId, preferredPurchaseDay, quantity } = formData;
    const endpoint = `${apiUrl}/customer-preferences`;
    const body = {
      customerId,
      productId,
      preferredPurchaseDay,
      quantity
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save preference');
      }

      const updatedPreference: CustomerPreferences = await response.json();

      setPreferences([...preferences, updatedPreference]);
      setEditPreferenceId(null);
      setEditPreference(null);
    } catch (error) {
      toast.error(c('errorUpdate'));
      console.error('Error saving preference:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{m('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg flex flex-row justify-between">
      {/* Customer Details */}
      <div className="w-1/3 pr-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">{t('customerDetails')}</h1>
        {customer ? (
          <div className="space-y-4">
            <p className="text-lg"><strong>{c('name')}:</strong> {customer.name}</p>
            <p className="text-lg"><strong>{t('email')}:</strong> {customer.email}</p>
            <p className="text-lg"><strong>{t('phoneNumber')}:</strong> {customer.phoneNumber}</p>
            <p className="text-lg"><strong>{t('address')}:</strong> {customer.address}</p>
            <div className="mt-6 flex space-x-4">
              <Link href={`/${locale}/customers/${customer.customerId}/edit`} className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-700">
                {c('edit')}
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-700"
              >
                {c('delete')}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-red-500">{t('customerNotFound')}</p>
        )}
      </div>

      {/* Customer Preferences */}
      <div className="w-1/3 px-6 border-l border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">{cp('title')}</h2>
        {loadingPreferences ? (
          <div>{cp('loading')}</div>
        ) : (
          <div className="space-y-4">
            {preferences.length === 0 ? (
              <p>{cp('noPreferences')}</p>
            ) : (
              preferences.map(preference => (
                <div key={preference.id} className="border p-4 rounded-lg shadow-md">
                  <p><strong>{cp('product')}:</strong> {products.find(product => product.productId === preference.productId)?.name || t('unknown')}</p>
                  <p><strong>{cp('preferredPurchaseDay')}:</strong> {days(preference.preferredPurchaseDay.toLowerCase())}</p>
                  <p><strong>{cp('quantity')}:</strong> {preference.quantity}</p>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleDeletePreference(preference.id)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
                    >
                      {c('delete')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add New Preference */}
      <div className="w-1/3 pl-6 border-l border-gray-200">
        <h3 className="text-xl font-bold mt-6 text-blue-900">
          {cp('addPreference')}
        </h3>

        <PreferenceForm
          products={products}
          customerId={customerId}
          existingPreference={editPreference}
          onSubmit={handleSubmitPreference}
        />
      </div>

      <ToastContainer />
    </div>
  );
};

export default CustomerDetailPage;
