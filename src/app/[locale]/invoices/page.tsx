'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import apiUrl from '@/utils/api';
import { Customer } from '@/types';
import { FiDownload } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import CustomerSelect from '@/app/components/CustomerSelect';

const InvoicesPage = () => {
  const t = useTranslations('invoices');
  const common = useTranslations('common');
  const locale = useLocale();

  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState<boolean>(false);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const customersResponse = await fetch(`${apiUrl}/customers`);
      if (!customersResponse.ok) throw new Error('Failed to fetch customers');
      const customersData: Customer[] = await customersResponse.json();
      setCustomers(customersData);
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchCustomers().finally(() => setLoading(false));
  }, []);

  const generateInvoice = async () => {
    if (!selectedCustomer || !startDate || !endDate) {
      toast.info(common('fillAllFields'));
      return;
    }

    // Start loading
    setLoadingInvoice(true);
    toast.info(common('generatingInvoice')); // Display a toast indicating that the invoice is being generated

    try {
      const response = await fetch(
        `${apiUrl}/invoices/generate-invoice?customerId=${selectedCustomer.customerId}&startDate=${startDate}&endDate=${endDate}&language=${locale}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      toast.success(common('invoiceGenerated'));

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate file name based on customer and period
      const formatInvoiceDate = (date: string): string => {
        const day = date.slice(8, 10);
        const month = date.slice(5, 7);
        const year = date.slice(0, 4);
        return `${day}-${month}-${year}`;
      };
      const startDateFormatted = formatInvoiceDate(startDate);
      const endDateFormatted = formatInvoiceDate(endDate);

      const customerName = selectedCustomer.name.replace(/ /g, '_');
      link.download = `${customerName}_${startDateFormatted}_${endDateFormatted}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      // Stop loading
      setLoadingInvoice(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{common('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{t('title')}</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        {/* Filters Section */}
        <div className="mb-6 flex space-x-4 items-center">
          {/* Customer Selector */}
          <div className="w-1/3">
            <CustomerSelect
              customers={customers}
              value={selectedCustomer}
              onChange={(customer) => {
                setSelectedCustomer(customer);
                setError(null);
              }}
            />
          </div>

          <div className="w-2/3 flex space-x-4 items-center">
            {/* Date Filters */}
            <label htmlFor="start">{t('start')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded w-1/2 text-center"
            />
            <label htmlFor="end">{t('end')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded w-1/2 text-center"
            />
          </div>
        </div>

        {/* Generate Invoice Button */}
        <div className="flex justify-center">
          <button
            onClick={generateInvoice}
            className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
            disabled={loadingInvoice}
          >
            <FiDownload className="inline mr-2" />
            {t('generateInvoice')}
          </button>
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
      <ToastContainer />
    </div>
  );
};

export default InvoicesPage;