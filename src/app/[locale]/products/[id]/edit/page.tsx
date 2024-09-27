'use client';

import { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import apiUrl from '@/utils/api';
import { Product, ProductData } from '@/types';
import { useTranslations } from 'next-intl';
import ProductForm from '@/app/components/ProductForm';
import { toast } from 'react-toastify';

const EditProductPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);

  const p = useTranslations('products');
  const m = useTranslations('messages');

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`${apiUrl}/products/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch product');
          }
          const data: Product = await response.json();
          setProduct(data);
        } catch (error: any) {
          console.error('Error fetching product:', error);
        }
      };

      fetchProduct();
    }
  }, [id]);


  const handleSubmit = async (data: ProductData) => {
    const response = await fetch(`${apiUrl}/products?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
  };

  if (!product) {
    return <div className="flex justify-center items-center h-screen">{m('loading')}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-blue-900">{p('editProduct')}</h1>
      <ProductForm initialData={product} onSubmit={handleSubmit} />
    </div>
  );
};

export default EditProductPage;
