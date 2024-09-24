'use client';

import { useEffect, useState } from 'react';
import { CustomerPreferences } from '@/types';
import apiUrl from '@/utils/api';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocale, useTranslations } from 'next-intl';

const CustomerPreferencesPage = () => {
  const [preferences, setPreferences] = useState<CustomerPreferences[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cp = useTranslations('customerPreferences');
  const m = useTranslations('messages');
  const c = useTranslations('common');
  const d = useTranslations('days');
  const locale = useLocale();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch(`${apiUrl}/customer-preferences`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer preferences');
        }
        const data: CustomerPreferences[] = await response.json();
        setPreferences(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const orderDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const filteredPreferences = [...preferences]
    .filter(preference => {
      const matchesSearch = preference.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDays = selectedDays.length
        ? selectedDays.some(day => preference.preferredPurchaseDays.includes(day))
        : true;
      return matchesSearch && matchesDays;
    })
    .sort((a, b) => {
      const aDays = a.preferredPurchaseDays.map(day => orderDays.indexOf(day)).sort((x, y) => x - y);
      const bDays = b.preferredPurchaseDays.map(day => orderDays.indexOf(day)).sort((x, y) => x - y);
      return aDays[0] - bDays[0];
    });

  const handleDaySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedDays(options);
  };

  const handleGenerateOrders = async () => {
    try {
      for (const preference of filteredPreferences) {
        const payload = {
          customerId: preference.customerId,
          saleDate: new Date().toISOString(),
          saleDetails: [
            {
              productId: preference.productId,
              quantity: preference.quantity,
            },
          ],
        };

        const response = await fetch(`${apiUrl}/sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(m('errorGeneratingOrders'));
        }
      }

      toast.success(m('ordersGeneratedSuccess'));
    } catch (error: any) {
      toast.error(error.message || m('errorGeneratingOrders'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{m('loading')}</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-900">{cp('title')}</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleGenerateOrders}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 no-print"
          >
            {cp('generateOrders')}
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-700 no-print"
          >
            {c('print')}
          </button>
        </div>
      </div>
      <div className="mb-4 no-print flex justify-between">
        <input
          type="text"
          placeholder={c('searchByName')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-1/3 mb-4 h-10"
        />
        <select
          multiple
          value={selectedDays}
          onChange={handleDaySelection}
          className="p-2 border rounded w-1/2 mb-2 h-44"
        >
          <option value="Monday">{d('monday')}</option>
          <option value="Tuesday">{d('tuesday')}</option>
          <option value="Wednesday">{d('wednesday')}</option>
          <option value="Thursday">{d('thursday')}</option>
          <option value="Friday">{d('friday')}</option>
          <option value="Saturday">{d('saturday')}</option>
          <option value="Sunday">{d('sunday')}</option>
        </select>
      </div>
      {filteredPreferences.length === 0 ? (
        <div className="text-red-500">{cp('noPreferences')}</div>
      ) : (
        <table className="min-w-full bg-white mt-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200">{cp('days')}</th>
              <th className="py-2 px-4 border-b border-gray-200">{cp('customer')}</th>
              <th className="py-2 px-4 border-b border-gray-200">{cp('product')}</th>
              <th className="py-2 px-4 border-b border-gray-200">{cp('quantity')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredPreferences.map((preference) => (
              <tr key={preference.id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b border-gray-200">
                  {preference.preferredPurchaseDays.map(day => `${d(`${day.toLocaleLowerCase()}`)}`).join(', ')}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  {preference.customerName}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  {preference.productName}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  {preference.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ToastContainer />
    </div>
  );
};

export default CustomerPreferencesPage;

