'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Order } from '@/types';
import { format } from 'date-fns-tz';

const FIRST_PAGE_ITEMS = 22; // Define o número de itens para a primeira página
const OTHER_PAGES_ITEMS = 26; // Define o número de itens para as outras páginas

const PrintOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productTotals, setProductTotals] = useState<{ [key: string]: { quantity: number } }>({});
  const t = useTranslations('orders');
  const days = useTranslations('days');

  useEffect(() => {
    const storedOrders = localStorage.getItem('printOrders');
    if (storedOrders) {
      const parsedOrders: Order[] = JSON.parse(storedOrders);
      setOrders(parsedOrders);
      calculateProductTotals(parsedOrders);
    }
  }, []);

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
    // Obtem todas as linhas com os produtos e seus dados
    const allRows = orders.flatMap((order) =>
      order.products.map((product, index) => (
        <tr key={`${order.id}-${index}`} className="hover:bg-gray-100">
          <td className="border text-center">
            {format(new Date(order.orderDate), 'dd/MM/yyyy', { timeZone: 'UTC' })} -- {days(getDayOfWeek(order.orderDate))}
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

    const pages = [];

    // Para a primeira página, usamos o limite de 22 itens
    let firstPageRows = allRows.slice(0, FIRST_PAGE_ITEMS);
    let firstPageEmptyRowsCount = FIRST_PAGE_ITEMS - firstPageRows.length;

    // Preenche linhas vazias se a primeira página tiver menos que 22 itens
    const firstPageEmptyRows = Array.from({ length: firstPageEmptyRowsCount }).map((_, index) => (
      <tr key={`first-empty-${index}`}>
        <td className="border px-2">&nbsp;</td>
        <td className="border px-2">&nbsp;</td>
        <td className="border px-2">&nbsp;</td>
        <td className="border px-2">&nbsp;</td>
        <td className="border px-2 text-center">
          <input type="checkbox" className="form-checkbox text-blue-600" />
        </td>
      </tr>
    ));

    // Adiciona a primeira página completa com itens e vazios
    pages.push([...firstPageRows, ...firstPageEmptyRows]);

    // Para as páginas subsequentes, usamos blocos de 26 itens
    for (let i = FIRST_PAGE_ITEMS; i < allRows.length; i += OTHER_PAGES_ITEMS) {
      const currentPageRows = allRows.slice(i, i + OTHER_PAGES_ITEMS); // Pega os próximos 26 itens
      const emptyRowsCount = OTHER_PAGES_ITEMS - currentPageRows.length; // Calcula quantas linhas vazias são necessárias

      // Preenche com linhas vazias se necessário
      const emptyRows = Array.from({ length: emptyRowsCount }).map((_, index) => (
        <tr key={`empty-${i}-${index}`}>
          <td className="border px-2">&nbsp;</td>
          <td className="border px-2">&nbsp;</td>
          <td className="border px-2">&nbsp;</td>
          <td className="border px-2">&nbsp;</td>
          <td className="border px-2 text-center">
            <input type="checkbox" className="form-checkbox text-blue-600" />
          </td>
        </tr>
      ));

      // Adiciona a página atual com os itens e as linhas vazias
      pages.push([...currentPageRows, ...emptyRows]);
    }

    // Retorna todas as páginas, uma após a outra
    return pages.flatMap((pageRows, pageIndex) => (
      <>
        {pageRows}
        {/* Adiciona uma quebra de página entre as páginas (exceto após a última) */}
        {pageIndex < pages.length - 1 && <tr className="break-before-page"></tr>}
      </>
    ));
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
              <span className="text-gray-700">{quantity.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
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