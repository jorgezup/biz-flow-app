'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Order } from '@/types';

const PrintOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const searchParams = useSearchParams();
  const t = useTranslations('orders');
  const days = useTranslations('days');

  useEffect(() => {
    const ordersParam = searchParams.get('orders');
    if (ordersParam) {
      const parsedOrders: Order[] = JSON.parse(decodeURIComponent(ordersParam));
      const sortedOrders = sortOrders(parsedOrders);
      setOrders(sortedOrders);
    }
  }, [searchParams]);

  const sortOrders = (ordersToSort: Order[]): Order[] => {
    return ordersToSort.sort((a, b) => {
      // First, sort by orderDate
      const dateComparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }
      // If dates are the same, sort by customerName
      return a.customerName.localeCompare(b.customerName);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getDayOfWeek = (date: string) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(date).getDay()];
  };

  const renderTableRows = () => {
    const rows = orders.flatMap((order) =>
      order.products.map((product, index) => (
        <tr key={`${order.id}-${index}`} className="hover:bg-gray-100">
          <td className="border py-2 px-4 text-center">{days(getDayOfWeek(order.orderDate))}</td>
          <td className="border py-2 px-4 text-center">{order.customerName}</td>
          <td className="border py-2 px-4 text-center">{product}</td>
          <td className="border py-2 px-4 text-center">{order.quantity[index] || '-'}</td>
          <td className="border py-3 px-4 text-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          </td>
        </tr>
      ))
    );

    const emptyRowsCount = Math.max(0, 12 - rows.length);
    const emptyRows = Array.from({ length: emptyRowsCount }).map((_, index) => (
      <tr key={`empty-${index}`}>
        <td className="border py-2 px-4">&nbsp;</td>
        <td className="border py-2 px-4">&nbsp;</td>
        <td className="border py-2 px-4">&nbsp;</td>
        <td className="border py-2 px-4">&nbsp;</td>
        <td className="border py-3 px-4 text-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </td>
      </tr>
    ));

    return [...rows, ...emptyRows];
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg print:landscape">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-blue-900">{t('printOrders')}</h1>
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
        >
          {t('print')}
        </button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border text-center">{t('day')}</th>
            <th className="py-2 px-4 border text-center">{t('customer')}</th>
            <th className="py-2 px-4 border text-center">{t('product')}</th>
            <th className="py-2 px-4 border text-center">{t('quantity')}</th>
            <th className="py-2 px-4 border text-center">{t('delivered')}</th>
          </tr>
        </thead>
        <tbody>
          {renderTableRows()}
        </tbody>
      </table>
    </div>
  );
};

export default PrintOrdersPage;