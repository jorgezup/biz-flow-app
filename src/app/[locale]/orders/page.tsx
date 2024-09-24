'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Chart } from 'react-google-charts';
import apiUrl from '@/utils/api';
import { Customer, Order, PaginatedResponse } from '@/types';
import { FiEye, FiPrinter, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import formatCurrency from '@/utils/currency';
import { noSSR } from 'next/dynamic';
import Pagination from '@/app/components/Pagination';
import { getCustomerName } from '@/utils/utils';


const OrderPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [editableStatus, setEditableStatus] = useState<{ [key: string]: string }>({});
  const [printList, setPrintList] = useState<Order[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('OrderDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Number of orders per page
  const [totalOrders, setTotalOrders] = useState(0); // Total number of orders
  const [allSelected, setAllSelected] = useState(false); // FiPrint

  const router = useRouter();

  const t = useTranslations('orders');
  const m = useTranslations('messages');
  const common = useTranslations('common');
  const locale = useLocale();

  const calculateTotal = () => {
    return filteredOrders.reduce((total, order) => total + order.totalAmount, 0);
  };

  const generateProductChart = () => {
    const productCount: { [key: string]: number } = {};

    filteredOrders.forEach(order => {
      order.products.forEach(product => {
        if (productCount[product]) {
          productCount[product] += order.quantity[0] || 1;
        } else {
          productCount[product] = order.quantity[0] || 1;
        }
      });
    });

    const labels = Object.keys(productCount);
    const data = Object.values(productCount);

    return [
      ['Products', 'Quantity'],
      ...labels.map((label, index) => [label, data[index]]),
    ];
  };

  const fetchOrders = async (
    page: number,
    pageSize: number,
    sortColumn: string,
    sortDirection: string,
    filters: { customerId?: string; status?: string; startDate?: string; endDate?: string }
  ) => {
    try {
      const { customerId, status, startDate, endDate } = filters;
      // Construct the query string
      let query = `page=${page}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;

      if (customerId) query += `&customerId=${customerId}`;
      if (status && status !== 'all') query += `&status=${status}`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;

      const response = await fetch(`${apiUrl}/orders?${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data: PaginatedResponse = await response.json();
      setOrders(data.data);
      setFilteredOrders(data.data); // Assuming response contains an array of orders
      setTotalOrders(data.totalRecords); // Assuming response contains total order count
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOrders(newPage, pageSize, sortColumn, sortDirection, { customerId: selectedCustomerId, status: statusFilter, startDate, endDate });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page after page size change
    // Fetch data based on the new page size
  };


  useEffect(() => {
    const fetchCustomersAndOrders = async () => {
      try {
        setLoading(true);

        // Fetch customers
        const customerResponse = await fetch(`${apiUrl}/customers`);
        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customers');
        }
        const customersData: Customer[] = await customerResponse.json();
        setCustomers(customersData);

        // Fetch orders
        await fetchOrders(
          currentPage,
          pageSize,
          sortColumn,
          sortDirection,
          { customerId: selectedCustomerId, status: statusFilter, startDate, endDate }
        );

      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersAndOrders();
  }, [
    currentPage,
    pageSize,
    sortColumn,
    sortDirection,
    selectedCustomerId,
    statusFilter,
    startDate,
    endDate
  ]);

  const handleStatusChange = async (orderId: string) => {
    const newStatus = editableStatus[orderId];
    try {
      const response = await fetch(`${apiUrl}/orders?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update status locally after successful response
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(t('statusUpdated'));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePrint = (order: Order) => {
    setPrintList(prevList => {
      const index = prevList.findIndex(item => item.id === order.id);
      if (index !== -1) {
        return prevList.filter(item => item.id !== order.id);
      } else {
        return [...prevList, order];
      }
    });
  };

  const handlePrintRedirect = () => {
    router.push(`/${locale}/orders/print?orders=${encodeURIComponent(JSON.stringify(printList))}`);
  };

  const handleSelectAllForPrint = () => {
    if (allSelected) {
      setPrintList([]); // Deselect all
    } else {
      setPrintList([...filteredOrders]); // Select all orders
    }
    setAllSelected(!allSelected); // Toggle the state
  };


  const handleGenerateOrders = async () => {
    try {
      const response = await fetch(`${apiUrl}/orders/generate-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(m('errorGeneratingOrders'));
      }

      fetchOrders(currentPage, pageSize, sortColumn, sortDirection, { customerId: selectedCustomerId, status: statusFilter, startDate, endDate });
      toast.success(m('ordersGeneratedSuccess'));
    } catch (error: any) {
      toast.error(error.message || m('errorGeneratingOrders'));
    }
  };

  const handleSort = (column: string) => {
    let newSortDirection: 'asc' | 'desc' = 'asc';

    if (sortColumn === column) {
      newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortColumn(column);
    setSortDirection(newSortDirection);

    // Trigger an API call with the new sorting column and direction
    fetchOrders(currentPage, pageSize, column, newSortDirection, { customerId: selectedCustomerId, status: statusFilter, startDate, endDate });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{m('loading')}</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{t('title')}</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        {/* Seletor de Cliente */}
        <div className="mb-6 w-full flex space-x-4">
          <div className="space-x-2 flex-1 flex items-center">
            <select onChange={(e) => setSelectedCustomerId(e.target.value)} className="p-2 border rounded w-2/4">
              <option value="">{t('selectCustomer')}</option>
              {customers.map((customer: Customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.name}
                </option>
              ))}
            </select>

            {/* Filtros de Data */}
            <label htmlFor="start">{t('start')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded text-center"
            />
            <label htmlFor="end">{t('end')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded text-center"
            />
            <select onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border rounded text-center" value={statusFilter}>
              <option value="All">{t('allStatus')}</option>
              <option value="Pending">{t('pending')}</option>
              <option value="Completed">{t('completed')}</option>
              <option value="Cancelled">{t('cancelled')}</option>
            </select>
          </div>

          <div className="space-x-2">
            <button
              onClick={handleGenerateOrders}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
              {t('generateOrders')}
            </button>
            <button
              onClick={handlePrintRedirect}
              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-700"
            >
              {t('print')}
            </button>
            <Link href={`/${locale}/orders/new`}>
              <button className="bg-green-500 text-white p-2 rounded hover:bg-green-700">
                {t('createNewOrder')}
              </button>
            </Link>
          </div>
        </div>

        {/* Tabela de Pedidos */}
        {filteredOrders?.length === 0 ? (
          <div className="text-red-500 mt-4 text-center">{t('noOrders')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4" onClick={() => handleSort('CustomerName')}>
                    {t('customer')} {sortColumn === 'CustomerName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-2 px-4" onClick={() => handleSort('Products')}>
                    {t('products')} {sortColumn === 'Products' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                  <th className="py-2 px-4" onClick={() => handleSort('OrderDate')}>
                    {t('orderDate')} {sortColumn === 'OrderDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-2 px-4" onClick={() => handleSort('Status')}>
                    {t('status')} {sortColumn === 'Status' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-2 px-4">
                    {t('amount')}
                  </th>
                  <th className="py-2 px-4">{t('actions')}</th>
                  <th className="py-2 px-4">
                    <FiPrinter onClick={handleSelectAllForPrint} style={{ cursor: 'pointer', display: 'inline' }} />
                  </th>

                </tr>
              </thead>
              <tbody>
                {filteredOrders?.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-100">
                    <td className=" py-3 px-4 text-center">
                    {getCustomerName(customers, order.customerId)}
                    </td>
                    <td className=" py-3 px-4 text-center">
                      {order.products.map(product => (
                        <div key={product}>{product}</div>
                      ))}
                    </td>
                    <td className=" py-3 px-4 text-center">{new Date(order.orderDate).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}</td>
                    <td className=" py-3 px-4 text-center">{t(order.status.toLowerCase())}</td>
                    <td className=" py-3 px-4 text-center">{formatCurrency(locale, order.totalAmount)}</td>
                    <td className=" py-3 px-4 text-center">
                      <div className="flex justify-center space-x-2 items-center">
                        <select
                          className="rounded p-2 border"
                          value={editableStatus[order.id] || ''}
                          onChange={(e) => setEditableStatus({ ...editableStatus, [order.id]: e.target.value })}
                        >
                          <option value="">{t('selectStatus')}</option>
                          <option value="Pending">{t('pending')}</option>
                          <option value="Completed">{t('completed')}</option>
                          <option value="Cancelled">{t('cancelled')}</option>
                        </select>
                        <button
                          onClick={() => handleStatusChange(order.id)}
                          className="p-2 text-blue-500 hover:text-blue-900"
                        >
                          <FiSave title={common('save')} />
                        </button>
                        <a
                          href={`/${locale}/orders/order-details/${order.id}/edit`}
                          className="text-blue-500 hover:text-blue-900"
                        >
                          <FiEye title={common('view')} />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={printList.some(item => item.id === order.id)}
                        onChange={() => handlePrint(order)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={totalOrders}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          translations={{
            previous: common('previous'),
            next: common('next'),
            page: common('page'),
            of: common('of')
          }}
        />

        <ToastContainer />
      </div>
    </div>
  );
};

export default OrderPage;


