'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SaleDetail } from '@/types';
import apiUrl from '@/utils/api';
import { useLocale, useTranslations } from 'next-intl';
import formatCurrency from '@/utils/currency';
import { toast } from 'react-toastify';

const EditSalePage = () => {
  const t = useTranslations('sales');
  const common = useTranslations('common');
  const sd = useTranslations('saleDetails');
  const locale = useLocale();
  const [saleDetails, setSaleDetails] = useState<SaleDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/order-details/order/${id}`);
        const data: SaleDetail[] = await response.json();
        setSaleDetails(data);
      } catch (error) {
        console.error('Failed to fetch sale details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [id]);

  const handleQuantityChange = (detailId: string, quantity: number) => {
    setSaleDetails((prevDetails) =>
      prevDetails.map((detail) => {
        // Verifica se unitPrice e quantity são válidos
        const unitPrice = detail.unitPrice || 0;
        const validQuantity = !isNaN(quantity) ? quantity : 0;
        const subtotal = validQuantity * unitPrice;
  
        return detail.id === detailId
          ? { ...detail, quantity: validQuantity, subtotal }
          : detail;
      })
    );
  };
  
  const handleSubTotal = (detailId: string, subtotal: number) => {
    setSaleDetails((prevDetails) =>
      prevDetails.map((detail) => {
        // Verifica se unitPrice e subtotal são válidos
        const unitPrice = detail.unitPrice || 0;
        const validSubtotal = !isNaN(subtotal) ? subtotal : 0;
        const quantity = unitPrice !== 0 ? validSubtotal / unitPrice : 0;
  
        return detail.id === detailId
          ? { ...detail, subtotal: validSubtotal, quantity }
          : detail;
      })
    );
  };
  

  const handleSave = async () => {
    setLoading(true);
    try {
      const saleDetailsArray = saleDetails.map((detail) => ({
        productId: detail.productId,
        quantity: detail.quantity,
        subtotal: detail.subtotal,
        id: detail.id
      }));

      // Envia todas as requisições em paralelo usando Promise.all
      const responses = await Promise.all(saleDetailsArray.map(orderDetail =>
        fetch(`${apiUrl}/order-details/${orderDetail.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: orderDetail.productId,
            quantity: orderDetail.quantity,
            subtotal: orderDetail.subtotal
          }),
        })
      ));

      // Verifica se todas as requisições foram bem-sucedidas
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        toast.success(t('editSaleSuccess'));
        setTimeout(() => {
          router.push(`/${locale}/orders`);
        }, 1000);
      } else {
        console.error('Failed to update one or more order details');
        // Opcional: iterar sobre `responses` e mostrar qual falhou
        responses.forEach((response, index) => {
          if (!response.ok) {
            console.error(`Failed to update order detail with id=${saleDetailsArray[index].id}`);
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-screen">{common('loading')}</div>;
  }

  const totalAmount = saleDetails.reduce((total, detail) => total + detail.subtotal, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{t('editSale')}</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <div>
            {saleDetails.length > 0 && (
              <p className="text-gray-900">{sd('customerName')}: <span className="font-bold">{saleDetails[0].customerName}</span></p>
            )}
          </div>
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
            disabled={loading}
          >
            {common('saveChanges')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">{sd('productName')}</th>
                <th className="py-3 px-4 text-center">{sd('quantity')}</th>
                <th className="py-3 px-4 text-right">{sd('unitPrice')}</th>
                <th className="py-3 px-4 text-right">{sd('subtotal')}</th>
              </tr>
            </thead>
            <tbody>
              {saleDetails.map((detail) => (
                <tr key={detail.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{detail.productName}</td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="number"
                      value={detail.quantity}
                      onChange={(e) => handleQuantityChange(detail.id, parseFloat(e.target.value))}
                      className="p-2 border rounded w-20 text-center"
                      min="0"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">{formatCurrency(locale, detail.unitPrice)}</td>
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      value={detail.subtotal}
                      onChange={(e) => handleSubTotal(detail.id, parseFloat(e.target.value))}
                      className="p-2 border rounded w-20 text-center"
                    />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-right">
          <p className="text-lg font-semibold">
            {sd('total')}: {formatCurrency(locale, totalAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditSalePage;
