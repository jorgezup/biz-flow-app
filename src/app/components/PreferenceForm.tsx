"use client";
import { useState, useEffect } from 'react';
import { Product, CustomerPreferences } from '@/types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslations } from 'next-intl';

interface PreferenceFormProps {
  products: Product[];
  customerId: string;
  editPreferenceId?: string;
  existingPreference?: CustomerPreferences | null;
  onSubmit: (preference: any) => Promise<void>;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PreferenceForm = ({
  products,
  customerId,
  editPreferenceId,
  existingPreference,
  onSubmit,
}: PreferenceFormProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [preferredPurchaseDay, setPreferredPurchaseDay] = useState<string>('');
  const [quantity, setQuantity] = useState<number | string>('');

  const cp = useTranslations('customerPreferences');
  const days = useTranslations('days');

  // Update form fields when existingPreference changes
  useEffect(() => {
    if (existingPreference) {
      setSelectedProductId(existingPreference.productId);
      setPreferredPurchaseDay(existingPreference.preferredPurchaseDay);
      setQuantity(existingPreference.quantity);
    }
  }, [existingPreference]);

  const handleDayChange = (day: string) => {
    setPreferredPurchaseDay(day);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newPreference = {
      customerId,
      productId: selectedProductId,
      preferredPurchaseDay,
      quantity,
    };

    try {
      await onSubmit(newPreference);
      setSelectedProductId('');
      setPreferredPurchaseDay('');
      setQuantity('');
      toast.success(cp(editPreferenceId ? 'successUpdate' : 'successCreate'));
    } catch (error) {
      toast.error(cp('errorUpdate'));
      console.error('Error saving preference:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="mt-2 p-2 border rounded w-full"
          required
        >
          <option value="">{cp('selectProduct')}</option>
          {products.map(product => (
            <option key={product.productId} value={product.productId}>{product.name}</option>
          ))}
        </select>
      </div>

      <div className="flex align-items-center space-x-2 mt-2">
        <label className="block text-gray-700 font-bold mt-2">{cp('quantity')}:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="p-2 border rounded w-1/3"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 font-bold">{cp('preferredPurchaseDay')}</label>
        <div className="flex flex-col space-y-2 mt-2">
          {daysOfWeek.map(day => (
            <div key={day} className="flex items-center space-x-2">
              <input
                type="radio"
                checked={preferredPurchaseDay === day}
                onChange={() => handleDayChange(day)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="text-gray-700">{days(day.toLowerCase())}</span>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
        {cp(editPreferenceId ? 'editPreference' : 'addPreference')}
      </button>
    </form>
  );
};

export default PreferenceForm;
