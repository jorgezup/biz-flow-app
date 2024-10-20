import React from 'react';
import { format, FormatOptionsWithTZ } from 'date-fns-tz';

interface FormattedDateProps {
  dateString: string;
  withHours?: boolean;
  timeZone?: string; // Permite passar um fuso horário opcional
  formatOptions?: FormatOptionsWithTZ; // Permite passar opções de formatação
}

const FormattedDate: React.FC<FormattedDateProps> = ({
  dateString,
  withHours = false,
  timeZone,
  formatOptions,
}) => {
  const userTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const date = new Date(dateString + 'Z'); // Assume que a data está em UTC

  // Usa `format` com as opções passadas
  const userDate = withHours
    ? format(date, 'dd/MM/yyyy HH:mm:ss', { timeZone: userTimeZone, ...formatOptions })
    : format(date, 'dd/MM/yyyy', { timeZone: userTimeZone, ...formatOptions });

  return <span>{userDate}</span>;
};

export default FormattedDate;