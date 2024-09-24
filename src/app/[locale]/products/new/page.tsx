'use client';

import ProductForm from '@/app/components/ProductForm';
import { ProductData } from '@/types';
import apiUrl from '@/utils/api';

const NewProductPage = () => {
  const handleSubmit = async (data: ProductData) => {
    const response = await fetch(`${apiUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
  };

  return <ProductForm onSubmit={handleSubmit} />;
};

export default NewProductPage;
