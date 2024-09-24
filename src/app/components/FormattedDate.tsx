import React from 'react';
import { formatInTimeZone } from 'date-fns-tz';

interface FormattedDateProps {
  dateString: string;
  withHours?: boolean;
}

const FormattedDate: React.FC<FormattedDateProps> = ({ dateString, withHours = false }) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const date = new Date(dateString + 'Z'); // Adiciona 'Z' para garantir que é UTC
  
  const userDate = withHours 
  ? formatInTimeZone(date, userTimeZone, 'dd/MM/yyyy HH:mm:ss')
  : formatInTimeZone(date, userTimeZone, 'dd/MM/yyyy')

  return <span>{userDate}</span>;
};

export default FormattedDate;
