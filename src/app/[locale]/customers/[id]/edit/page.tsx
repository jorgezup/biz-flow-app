'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiUrl from '@/utils/api';
import { Customer } from '@/types';
import { useLocale, useTranslations } from 'next-intl';

const EditCustomerPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const t = useTranslations('customers');
  const c = useTranslations('common');
  const m = useTranslations('messages');
  const locale = useLocale();

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const response = await fetch(`${apiUrl}/customers/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch customer');
          }
          const data: Customer = await response.json();
          setCustomer(data);
        } catch (error) {
          console.error('Error fetching customer:', error);
        }
      };

      fetchCustomer();
    }
  }, [id]);

  useEffect(() => {
    // Check if form is valid
    if (customer) {
      setIsFormValid(
        customer.name.trim() !== '' &&
        // customer.email.trim() !== '' &&
        customer.phoneNumber.trim() !== ''
        // customer.address.trim() !== ''
      );
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/customers?customerId=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customer),
      });
      if (!response.ok) {
        throw new Error('Failed to update customer');
      }
      toast.success(c('successUpdate'));
      setTimeout(() => {
        router.push(`/${locale}/customers`);
      }, 1000);
    } catch (error) {
      toast.error(c('errorUpdate'));
      console.error('Error updating customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!customer) {
    return <div className="flex justify-center items-center h-screen">{m('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">{t('editCustomer')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">{c('name')}</label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            className="mt-2 p-2 border rounded w-full"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-gray-700">{t('email')}</label>
          <input
            type="email"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            className="mt-2 p-2 border rounded w-full"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-gray-700">{t('phoneNumber')}</label>
          <input
            type="text"
            value={customer.phoneNumber}
            onChange={(e) => setCustomer({ ...customer, phoneNumber: e.target.value })}
            className="mt-2 p-2 border rounded w-full"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-gray-700">{t('address')}</label>
          <input
            type="text"
            value={customer.address}
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
            className="mt-2 p-2 border rounded w-full"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className={`mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 ${isSubmitting ? 'bg-gray-400' : ''}`}
          disabled={!isFormValid || isSubmitting}
        >
          {c('update')}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditCustomerPage;
