'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import apiUrl from '@/utils/api';
import Pagination from '@/app/components/Pagination';
import { Customer, CustomerPendingPayment } from '@/types';
import formatCurrency from '@/utils/currency';
import CustomerSelect from '@/app/components/CustomerSelect';
import { set } from 'date-fns';

const PaymentsPage = () => {
  const t = useTranslations('payments');
  const common = useTranslations('common');
  const locale = useLocale();

  // State management
  const [pendingPayments, setPendingPayments] = useState<CustomerPendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch pending payments data
  const fetchPendingPayments = async (customerId?: string) => {
    try {
      setLoading(true);
      let query = '';
      if (customerId) {
        query = `?customerId=${customerId}`;
      }
      const response = await fetch(`${apiUrl}/payments/pending-payments${query}`);
      if (!response.ok) throw new Error('Failed to fetch pending payments');

      const result = await response.json();
      setPendingPayments(result.customerPendingPayment);
      setTotalPendingAmount(result.totalPendingAmount);
      setTotalRecords(result.totalRecords);

      const customers: Customer[] = result.customerPendingPayment.map((customer: CustomerPendingPayment) => ({
        customerId: customer.customerId,
        name: customer.customerName,
      }))

      setCustomers(customers);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending payments on component mount and when selectedCustomer changes
  useEffect(() => {
    fetchPendingPayments(selectedCustomer?.customerId);
  }, [selectedCustomer]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{common('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{t('title')}</h1>

      {/* Navigation Buttons */}
      {/* <div className="mb-20 text-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
          onClick={() => (window.location.href = `/${locale}/payments/pending-payments`)}
        >
          {t('pendingPayments')}
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => (window.location.href = `/${locale}/payments/completed-payments`)}
        >
          {t('completedPayments')}
        </button>
      </div> */}

      {/* Pending Payments Table */}
      {pendingPayments.length === 0 ? (
        <p className="text-red-500 text-center p-8">{t('noPendingPayments')}</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <div className="overflow-x-auto">
            {/* Filters */}
            <div className="mb-12 flex space-x-4 justify-between">
              <div className="w-1/2">
                <CustomerSelect
                  customers={customers}
                  value={selectedCustomer}
                  onChange={(customer) => {
                    setSelectedCustomer(customer);
                    setCurrentPage(1); // Reset to first page when customer changes
                  }}
                />
              </div>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => (window.location.href = `/${locale}/payments/completed-payments`)}
              >
                {t('completedPayments')}
              </button>
            </div>
            <div className="mb-2 flex space-x-4 justify-between">
              <p className="text-xl font-bold text-blue-900 text-center">
                {t('pendingPaymentsTitle')}
              </p>
              {/* Display total pending amount */}
              <div>
                <span className="font-bold text-xl">{t('totalPendingAmount')}: </span>
                <span className="text-xl">{formatCurrency(locale, totalPendingAmount)}</span>
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-center">{t('customer')}</th>
                  <th className="py-3 px-4 text-center">{t('pendingAmount')}</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments?.map((payment) => (
                  <tr key={payment.customerId} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-4 text-center">
                      <a
                        href={`/${locale}/payments/pending-payments/${payment.customerId}`}
                        className="text-blue-500 hover:underline"
                      >
                        {payment.customerName}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {formatCurrency(locale, payment.totalPendingAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;