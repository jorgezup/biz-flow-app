'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Order } from '@/types';
import FormattedDate from '@/app/components/FormattedDate';

const PrintOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productTotals, setProductTotals] = useState<{ [key: string]: { quantity: number } }>({});
  const searchParams = useSearchParams();
  const t = useTranslations('orders');
  const days = useTranslations('days');

  useEffect(() => {
    const ordersParam = searchParams.get('orders');
    if (ordersParam) {
      const parsedOrders: Order[] = JSON.parse(decodeURIComponent(ordersParam));
      const sortedOrders = sortOrders(parsedOrders);
      setOrders(sortedOrders);
      calculateProductTotals(sortedOrders);
    }
  }, [searchParams]);

  const sortOrders = (ordersToSort: Order[]): Order[] => {
    return ordersToSort.sort((a, b) => {
      const dateComparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }
      return a.customerName.localeCompare(b.customerName);
    });
  };

  // Função para calcular a quantidade total de cada produto
  const calculateProductTotals = (orders: Order[]) => {
    const totals: { [key: string]: { quantity: number } } = {};

    orders.forEach((order) => {
      order.products.forEach((product, index) => {
        const quantity = order.quantity[index];
        if (totals[product]) {
          totals[product].quantity += quantity;
        } else {
          totals[product] = { quantity };
        }
      });
    });

    setProductTotals(totals);
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
          <td className="border text-center">
            {<FormattedDate dateString={order.orderDate} />} -- {days(getDayOfWeek(order.orderDate))}
          </td>
          <td className="border text-center">{order.customerName}</td>
          <td className="border text-center">{product}</td>
          <td className="border text-center">{order.quantity[index] || '-'}</td>
          <td className="border text-center">
            <input type="checkbox" className="form-checkbox text-blue-600" />
          </td>
        </tr>
      ))
    );

    const emptyRowsCount = Math.max(0, 26 - rows.length);
    const emptyRows = Array.from({ length: emptyRowsCount }).map((_, index) => (
      <tr key={`empty-${index}`}>
        <td className="border px-2">&nbsp;</td>
        <td className="border px-2">&nbsp;</td>
        <td className="border px-2">&nbsp;</td>
        <td className="border px-2">&nbsp;</td>
        <td className="border px-2 text-center">
          <input type="checkbox" className="form-checkbox text-blue-600" />
        </td>
      </tr>
    ));

    return [...rows, ...emptyRows];
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg print:landscape">
      {/* Botão para imprimir */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-blue-900">{t('printOrders')}</h1>
        <button onClick={handlePrint} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
          {t('print')}
        </button>
      </div>

      {/* Lista da quantidade de cada produto com layout em colunas */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-blue-900 no-print mb-2">{t('productSummary')}</h2>
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(productTotals).map(([product, { quantity }]) => (
            <div key={product} className="flex space-x-4 items-center rounded">
              <span className="font-semibold">{product}</span>
              <span className="text-gray-700">{quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de pedidos */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border text-center">{t('day')}</th>
            <th className="border text-center">{t('customer')}</th>
            <th className="border text-center">{t('product')}</th>
            <th className="border text-center">{t('quantity')}</th>
            <th className="border text-center">{t('delivered')}</th>
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>
    </div>
  );
};

export default PrintOrdersPage;
