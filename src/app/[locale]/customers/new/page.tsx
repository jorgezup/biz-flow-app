'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiUrl from '@/utils/api';
import { Product, CustomerPreferences } from '@/types';
import { useLocale, useTranslations } from 'next-intl';
import PreferenceForm from '@/app/components/PreferenceForm';

const NewCustomerPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [preferences, setPreferences] = useState<CustomerPreferences[]>([]);

  const t = useTranslations('customers');
  const c = useTranslations('common');
  const cp = useTranslations('customerPreferences');
  const locale = useLocale();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phoneNumber,
          address,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create customer');
      }
      const newCustomer = await response.json();
      setCustomerId(newCustomer.customerId);
      toast.success(t('successToast'));
    } catch (error) {
      toast.error(t('errorToast'));
      console.error('Error creating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPreference = async (formData: {
    productId: string;
    preferredPurchaseDay: string;
    quantity: number;
  }) => {
    if (!customerId) return;

    try {
      const response = await fetch(`${apiUrl}/customer-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          ...formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preference');
      }

      const newPreference: CustomerPreferences = await response.json();
      setPreferences([...preferences, newPreference]);
      toast.success(c('successCreate'));
    } catch (error) {
      toast.error(c('errorCreate'));
      console.error('Error saving preference:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">{t('new')}</h1>

      <div className='flex mx-auto justify-between space-x-16'>
        <div className='w-1/2'>
          <form onSubmit={handleSubmitCustomer} className="space-y-4">
            <div>
              <label className="block text-gray-700">{c('name')} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 p-2 border rounded w-full"
                disabled={isSubmitting || !!customerId}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 p-2 border rounded w-full"
                disabled={isSubmitting || !!customerId}
              />
            </div>
            <div>
              <label className="block text-gray-700">{t('phoneNumber')}</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-2 p-2 border rounded w-full"
                disabled={isSubmitting || !!customerId}
              />
            </div>
            <div>
              <label className="block text-gray-700">{t('address')}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-2 p-2 border rounded w-full"
                disabled={isSubmitting || !!customerId}
              />
            </div>
            <button
              type="submit"
              className={`mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 ${isSubmitting ? 'bg-gray-400' : ''}`}
              disabled={isSubmitting || !!customerId}
            >
              {c('create')}
            </button>
          </form>
        </div>
        {customerId && (
          <div className="w-1/2">
            <h3 className="text-2xl font-bold mt-6 text-blue-900">{cp('addPreference')}</h3>
            <PreferenceForm
              products={products}
              customerId={customerId}
              existingPreference={null}
              onSubmit={handleSubmitPreference}
            />
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default NewCustomerPage;

