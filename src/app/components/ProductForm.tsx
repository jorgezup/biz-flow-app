'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocale, useTranslations } from 'next-intl';
import { Product, ProductData } from '@/types';

// Type the props including initialData and onSubmit
interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductData) => void; // onSubmit receives ProductData and returns void
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData = {}, onSubmit }) => {
  const router = useRouter();
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [unitOfMeasure, setUnitOfMeasure] = useState(initialData.unitOfMeasure || '');
  const [price, setPrice] = useState<number | string>(initialData.price || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const p = useTranslations('products');
  const c = useTranslations('common');
  const locale = useLocale();

  useEffect(() => {
    setIsFormValid(
      name.trim() !== '' &&
      unitOfMeasure.trim() !== '' &&
      price !== '' &&
      parseFloat(price as string) > 0
    );
  }, [name, unitOfMeasure, price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      onSubmit({ name, description, unitOfMeasure, price: typeof price === 'string' ? parseFloat(price) : price });
      toast.success(c('successCreate'));
      setTimeout(() => {
        router.push(`/${locale}/products`);
      }, 1000);
    } catch (error) {
      toast.error(c('errorCreate'));
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">{c('name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 p-2 border rounded w-full"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-gray-700">{p('description')}</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 p-2 border rounded w-full"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-gray-700">{p('unitOfMeasure')}</label>
          <select
            value={unitOfMeasure}
            onChange={(e) => setUnitOfMeasure(e.target.value)}
            className="mt-2 p-2 border rounded w-full"
            disabled={isSubmitting}
          >
            <option value="unit">{p('unit')}</option>
            <option value="kg">{p('kg')}</option>
            <option value="liter">{p('liter')}</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700">{p('price')}</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 p-2 border rounded w-full"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className={`mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 ${isSubmitting ? 'bg-gray-400' : ''}`}
          disabled={!isFormValid || isSubmitting}
        >
          {c('create')}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ProductForm;
