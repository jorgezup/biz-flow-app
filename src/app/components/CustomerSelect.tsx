import React from 'react';
import Select from 'react-select';
import { Customer } from '@/types';
import { useTranslations } from 'next-intl';

interface CustomerSelectProps {
  customers: Customer[];
  value: Customer | null;
  onChange: (selectedCustomer: Customer | null) => void;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({ customers, value, onChange }) => {
  const options = customers.map((customer) => ({
    value: customer.customerId,
    label: customer.name,
  }));
  const common = useTranslations('common');

  const handleChange = (option: { value: string; label: string } | null) => {
    const selectedCustomer = customers.find((c) => c.customerId === option?.value) || null;
    onChange(selectedCustomer);
  };

  const selectedOption = value
    ? { value: value.customerId, label: value.name }
    : null;

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={handleChange}
      isClearable
      placeholder={common('selectCustomer')}
    />
  );
};

export default CustomerSelect;