export const UZBEK_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

/**
 * Format integer UZS amounts with space separators and Uzbek suffix.
 * e.g. 1000000 -> "1 000 000 so'm"
 */
export function formatUZS(amount: number | undefined | null, includeSuffix = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `0${includeSuffix ? " so'm" : ''}`;
  }
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const absVal = Math.abs(rounded);
  
  // Format with spaces as thousand separators (Uzbek standard)
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const prefix = isNegative ? '-' : '';
  const suffix = includeSuffix ? " so'm" : '';

  return `${prefix}${formatted}${suffix}`;
}

export function parseUZSInput(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatUzbekDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthName = UZBEK_MONTHS[monthIdx] || parts[1];
  return `${day}-${monthName.toLowerCase()}, ${year}`;
}

export function formatMonthName(monthStr: string): string {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const idx = parseInt(month, 10) - 1;
  return `${UZBEK_MONTHS[idx] || month} ${year}`;
}

export const INCOME_CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  salary: { label: 'Oylik maosh', icon: 'Briefcase' },
  business: { label: 'Kichik biznes', icon: 'Store' },
  freelance: { label: 'Frilans va loyihalar', icon: 'Laptop' },
  additional: { label: "Qo'shimcha daromad", icon: 'TrendingUp' },
  investment: { label: 'Investitsiya & passiv', icon: 'PiggyBank' },
  other: { label: 'Boshqa daromad', icon: 'PlusCircle' },
};

export const EXPENSE_CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  food: { label: 'Oziq-ovqat va bozor', icon: 'Utensils' },
  transport: { label: 'Transport va yoqilgʻi', icon: 'Car' },
  clothing: { label: 'Kiyim-kechak', icon: 'Shirt' },
  health: { label: 'Salomatlik va dorixona', icon: 'HeartPulse' },
  education: { label: "Ta'lim va kurslar", icon: 'GraduationCap' },
  communication: { label: 'Aloqa va internet', icon: 'Wifi' },
  entertainment: { label: 'Hordiq va koʻngilochar', icon: 'Gamepad2' },
  household: { label: 'Roʻzgʻor buyumlari', icon: 'Home' },
  shopping: { label: 'Shaxsiy xaridlar', icon: 'ShoppingBag' },
  other: { label: 'Boshqa xarajatlar', icon: 'Layers' },
};

export const UTILITY_CATEGORY_LABELS: Record<string, { label: string; icon: string; unit: string }> = {
  electricity: { label: 'Elektr energiyasi', icon: 'Zap', unit: 'kVt' },
  gas: { label: 'Tabiiy gaz', icon: 'Flame', unit: 'm³' },
  water: { label: 'Ichimlik suvi', icon: 'Droplets', unit: 'm³' },
  heating: { label: 'Markaziy isitish tizimi', icon: 'Thermometer', unit: 'oy' },
  internet: { label: 'Uy interneti va TV', icon: 'Wifi', unit: 'oy' },
  waste: { label: 'Chiqindi tozalash (Maxsustrans)', icon: 'Trash2', unit: 'kishi' },
  housing: { label: 'Uy-joy / JEK / Shirkat', icon: 'Building', unit: 'oy' },
  other: { label: 'Boshqa kommunal toʻlov', icon: 'Wrench', unit: 'xizmat' },
};

export const MANDATORY_CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  tax: { label: 'Soliqlar (Daromad, yer, mol-mulk)', icon: 'Receipt' },
  insurance: { label: "Sug'urta to'lovlari (Avto/Tibbiy)", icon: 'ShieldCheck' },
  government: { label: 'Davlat bojlari va jarimalar', icon: 'Scale' },
  mandatory_fee: { label: 'Majburiy yillik / oylik badallar', icon: 'CheckCircle2' },
  loan_repayment: { label: "Kredit yoki qarz to'lovi", icon: 'CreditCard' },
  other_mandatory: { label: 'Boshqa qatʼiy toʻlovlar', icon: 'AlertCircle' },
};

export const GOAL_PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: 'Yuqori muhimlik', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  medium: { label: "O'rtacha", color: 'text-blue-700 bg-blue-50 border-blue-200' },
  low: { label: 'Past', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export const GOAL_STATUS_LABELS: Record<string, { label: string; color: string; badge: string }> = {
  on_track: { label: 'Rejada ketmoqda', color: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  at_risk: { label: 'Xavf ostida', color: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  completed: { label: 'Bajarildi', color: 'text-indigo-700', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};
