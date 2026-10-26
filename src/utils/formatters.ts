export function formatCurrency(amount: number, currency: string = '₹'): string {
  if (isNaN(amount)) return `${currency} 0`;
  
  if (currency === '₹') {
    // Format according to Indian Numbering System (Lakhs / Crores)
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
  
  return `${currency} ${amount.toLocaleString('en-US')}`;
}

export function isPersonalsCategory(categoryId?: string): boolean {
  return categoryId === 'dating_friendship';
}

export function formatListingPrice(
  amount: number,
  currency: string = '₹',
  categoryId?: string
): string {
  if (isPersonalsCategory(categoryId) && (!amount || amount <= 0)) {
    return 'Free Connect';
  }
  return formatCurrency(amount, currency);
}

export function formatCategoryDisplayName(categoryId: string): string {
  if (categoryId === 'dating_friendship') return 'Dating & Friendship (18+)';
  return categoryId.replace(/_/g, ' ');
}

export function formatCompactNumber(num: number): string {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1).replace(/\.0$/, '') + ' Cr';
  }
  if (num >= 100000) {
    return (num / 100000).toFixed(1).replace(/\.0$/, '') + ' Lakh';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export function getCategoryIconColor(categoryId: string): string {
  switch (categoryId) {
    case 'cars':
    case 'vehicles':
      return 'bg-emerald-100 text-emerald-700';
    case 'properties':
      return 'bg-blue-100 text-blue-700';
    case 'mobiles':
      return 'bg-indigo-100 text-indigo-700';
    case 'bikes':
      return 'bg-amber-100 text-amber-700';
    case 'electronics':
      return 'bg-violet-100 text-violet-700';
    case 'furniture':
    case 'home_goods':
      return 'bg-rose-100 text-rose-700';
    case 'dating_friendship':
      return 'bg-rose-100 text-rose-700';
    case 'commercial':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-teal-100 text-teal-700';
  }
}
