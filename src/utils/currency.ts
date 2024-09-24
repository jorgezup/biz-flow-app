const formatCurrency = (locale: string, amount: number) => {
  return locale === 'pt-br' ? `R$ ${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
};

export default formatCurrency;