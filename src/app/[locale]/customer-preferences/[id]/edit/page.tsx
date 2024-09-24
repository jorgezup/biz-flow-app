'use client';

import { useEffect, useState } from 'react';
import { CustomerPreferences, Product } from '@/types';
import apiUrl from '@/utils/api';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EditCustomerPreferencePage = ({ params }: { params: { id: string } }) => {
  const preferenceId = params.id;
  const [preference, setPreference] = useState<CustomerPreferences | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [preferredPurchaseDays, setPreferredPurchaseDays] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const response = await fetch(`${apiUrl}/customer-preferences/${preferenceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch preference');
        }
        const data: CustomerPreferences = await response.json();
        setPreference(data);
        setPreferredPurchaseDays(data.preferredPurchaseDays || []);
        setSelectedProductId(data.productId);
      } catch (error) {
        console.error('Failed to fetch preference:', error);
      } finally {
        setLoading(false);
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

    fetchPreference();
    fetchProducts();
  }, [preferenceId]);

  const handleCheckboxChange = (day: string) => {
    setPreferredPurchaseDays(prevDays =>
      prevDays.includes(day)
        ? prevDays.filter(d => d !== day)
        : [...prevDays, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      preferredPurchaseDays,
      productId: selectedProductId,
    };

    try {
      const response = await fetch(`${apiUrl}/customer-preferences?id=${preferenceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      toast.success('Preference updated successfully!');
      setTimeout(() => {
        router.push('/customer-preferences');
      }, 2000);
    } catch (error) {
      toast.error('Error updating preference');
      console.error('Error updating preference:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!preference) {
    return <div className="flex justify-center items-center h-screen">Preference not found.</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Edit Customer Preference</h1>
      {preference ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
              required
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.productId} value={product.productId}>{product.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Preferred Purchase Days</label>
            <div className="flex flex-col space-y-2 mt-2">
              {daysOfWeek.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferredPurchaseDays.includes(day)}
                    onChange={() => handleCheckboxChange(day)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-gray-700">{day}</span>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            Update Preference
          </button>
        </form>
      ) : (
        <p className="text-red-500">No preference found.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default EditCustomerPreferencePage;
