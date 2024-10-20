import React from 'react';
import Select from 'react-select';
import { Customer } from '@/types';

interface CustomerSelectProps {
  customers: Customer[];
  value: Customer | null;
  onChange: (selectedCustomer: Customer | null) => void;
  isClearable?: boolean;
  styles?: any;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
  customers,
  value,
  onChange,
  isClearable,
  styles,
}) => {
  const options = customers.map((customer) => ({
    value: customer.customerId,
    label: customer.name,
  }));

  const handleChange = (option: { value: string; label: string } | null) => {
    const selectedCustomer = customers.find(
      (c) => c.customerId === option?.value
    ) || null;
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
      isClearable={isClearable}
      placeholder="Selecione um cliente..."
      styles={{
        ...styles,
        menuList: (provided: any) => ({
          ...provided,
          maxHeight: '150px',
        }),
      }}
    />
  );
};

export default CustomerSelect;