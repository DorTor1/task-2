export const formatDateTime = (input: string | number | Date) => {
  try {
    const date = input instanceof Date ? input : new Date(input);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    return String(input);
  }
};

export const formatCurrency = (value: number, currency: string = 'RUB') => {
  if (Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

