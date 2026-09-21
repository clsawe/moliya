import {
  TaxProfile,
  TaxType,
  TaxProfileType,
  TaxCalculationMethod,
  TaxEstimationResult,
  TaxObligationStatus,
} from '../types';

/**
 * Rasmiy soliq qonunchiligi konfiguratsiyasi (O‘zbekiston Respublikasi Soliq Kodeksi asosida)
 *
 * Diqqat: Ushbu parametrlar tizimda yagona konfiguratsiya sifatida saqlanadi va
 * davlat qonunchiligi o'zgarganda osongina yangilanadi.
 * Kod ichida stavkalarni tasodifiy yoki o'zboshimchalik bilan ishlatish taqiqlanadi.
 */
export const UZBEKISTAN_TAX_CONFIG = {
  // Bazaviy hisoblash miqdori (BHM) - 2026-yil holatiga
  BHM_AMOUNT_UZS: 375000,

  // Jismoniy shaxslardan olinadigan daromad solig'i (JShODS - O'zR Soliq Kodeksi 381-modda)
  INCOME_TAX_DEFAULT_RATE_PERCENT: 12, // 12% tekis stavka

  // Yakka tartibdagi tadbirkorlar (YTT) aylanmadan olinadigan soliq (467-modda)
  TURNOVER_TAX_DEFAULT_RATE_PERCENT: 4, // 4% bazaviy aylanma solig'i

  // O'zini o'zi band qilgan shaxslar (Daromad solig'idan 100% ozod, ijtimoiy soliq yillik ixtiyoriy 1 BHM)
  SELF_EMPLOYED_INCOME_TAX_RATE_PERCENT: 0,
  SELF_EMPLOYED_ANNUAL_SOCIAL_TAX_BHM: 1, // 1 BHM/yiliga pensiya staji hisoblash uchun

  // YTT uchun oylik majburiy ijtimoiy soliq (SK 408-modda: oyiga kamida 1 BHM)
  ENTREPRENEUR_MONTHLY_SOCIAL_TAX_BHM: 1,

  // Qat'iy belgilangan soliq (Hudud va faoliyat turiga ko'ra o'rtacha ko'rsatkich)
  FIXED_TAX_DEFAULT_ESTIMATE_UZS: 350000,

  // Rasmiy soliq hisoboti va to'lov muddatlari (Soliq Kodeksi me'yorlari):
  OFFICIAL_DEADLINES: {
    // Daromad solig'i: hisobot oyidan keyingi oyning 15-kuni
    monthlyIncomeTaxDay: 15,
    // Aylanmadan olinadigan soliq: hisobot choragidan keyingi oyning 15-kuni
    quarterlyTurnoverTaxDay: 15,
    // Mol-mulk va yer solig'i: 15-may va 15-oktabr
    propertyTaxMonths: ['05-15', '10-15'],
  },

  DISCLAIMER_TEXT: 'Taxminiy hisob-kitob. Rasmiy soliq majburiyati o‘rnini bosmaydi.',
  OFFICIAL_API_NOTICE: 'Rasmiy soliq ma’lumotlarini ulash hali mavjud emas',
};

export const TAX_TYPE_INFO: Record<
  TaxType,
  {
    label: string;
    description: string;
    defaultRate: number;
    legalReference: string;
  }
> = {
  income_tax: {
    label: 'JShODS (Daromad solig‘i)',
    description: 'Jismoniy shaxs daromadlaridan olinadigan 12% qatʼiy soliq stavkasi',
    defaultRate: 12,
    legalReference: 'O‘zR Soliq Kodeksi 381-modda (12%)',
  },
  turnover_tax: {
    label: 'Aylanmadan olinadigan soliq (YTT)',
    description: 'Yakka tartibdagi tadbirkorlik va xususiy xizmat tushumidan 4%',
    defaultRate: 4,
    legalReference: 'O‘zR Soliq Kodeksi 467-modda (4%)',
  },
  fixed_tax: {
    label: 'Qatʼiy belgilangan soliq',
    description: 'Muayyan faoliyat turlari bo‘yicha qatʼiy belgilangan oylik to‘lov',
    defaultRate: 0,
    legalReference: 'Soliq stavkalari to‘g‘risidagi qaror',
  },
  self_employed: {
    label: 'O‘zini o‘zi band qilganlar',
    description: 'Daromad solig‘i 0%. Pensiya staji uchun yiliga 1 BHM ixtiyoriy ijtimoiy to‘lov',
    defaultRate: 0,
    legalReference: 'PQ-4742-son qarori (Daromad solig‘idan ozod)',
  },
  property_tax: {
    label: 'Mol-mulk va Yer solig‘i',
    description: 'Ko‘chmas mulk va yer uchastkalari uchun yillik majburiy to‘lov',
    defaultRate: 1.5,
    legalReference: 'O‘zR Soliq Kodeksi 415 va 429-moddalar',
  },
  social_tax: {
    label: 'Ijtimoiy soliq',
    description: 'YTT va xodimlar uchun pensiya va sug‘urta fondi to‘lovi',
    defaultRate: 12,
    legalReference: 'O‘zR Soliq Kodeksi 408-modda',
  },
  custom: {
    label: 'Boshqa / Maxsus tarif',
    description: 'Foydalanuvchi tomonidan mustaqil kiritilgan stavka yoki kelishuv',
    defaultRate: 0,
    legalReference: 'Foydalanuvchi hisob-kitobi',
  },
};

export const TAX_PROFILE_TYPE_LABELS: Record<TaxProfileType, string> = {
  individual: 'Jismoniy shaxs (Xodim / Oylik maosh)',
  entrepreneur: 'YTT (Yakka tartibdagi tadbirkor)',
  self_employed: 'O‘zini o‘zi band qilgan shaxs (Frilanser)',
  legal_entity: 'Yuridik shaxs / Kichik korxona',
};

/**
 * Avtomatik taxminiy soliq hisoblash sof funksiyasi
 *
 * @param profile Foydalanuvchi soliq profili
 * @param monthlyIncome Oylik daromad miqdori
 */
export function calculateEstimatedTax(
  profile: TaxProfile,
  monthlyIncome: number
): TaxEstimationResult {
  const cleanIncome = Math.max(0, Math.round(Number(monthlyIncome) || 0));
  let calculatedTaxAmount = 0;
  let ratePercent = 0;
  let formulaDescription = '';

  switch (profile.taxType) {
    case 'income_tax': {
      ratePercent = profile.customRatePercent ?? UZBEKISTAN_TAX_CONFIG.INCOME_TAX_DEFAULT_RATE_PERCENT;
      calculatedTaxAmount = Math.round((cleanIncome * ratePercent) / 100);
      formulaDescription = `${cleanIncome.toLocaleString('uz-UZ')} UZS × ${ratePercent}% = ${calculatedTaxAmount.toLocaleString('uz-UZ')} UZS`;
      break;
    }
    case 'turnover_tax': {
      ratePercent = profile.customRatePercent ?? UZBEKISTAN_TAX_CONFIG.TURNOVER_TAX_DEFAULT_RATE_PERCENT;
      calculatedTaxAmount = Math.round((cleanIncome * ratePercent) / 100);
      formulaDescription = `Aylanma daromad ${cleanIncome.toLocaleString('uz-UZ')} UZS × ${ratePercent}% = ${calculatedTaxAmount.toLocaleString('uz-UZ')} UZS`;
      break;
    }
    case 'self_employed': {
      ratePercent = 0;
      // O'zini o'zi band qilganlar daromad solig'idan ozod. Ijtimoiy to'lov 1 BHM yiliga / 12 oyga taqsimlanishi mumkin
      const monthlySocialTax = Math.round(
        (UZBEKISTAN_TAX_CONFIG.BHM_AMOUNT_UZS * UZBEKISTAN_TAX_CONFIG.SELF_EMPLOYED_ANNUAL_SOCIAL_TAX_BHM) / 12
      );
      calculatedTaxAmount = monthlySocialTax;
      formulaDescription = `Daromad solig‘i 0% (Ozod). Ixtiyoriy ijtimoiy staj to‘lovi: 1 BHM yillik (${UZBEKISTAN_TAX_CONFIG.BHM_AMOUNT_UZS.toLocaleString('uz-UZ')} UZS / 12 oy = ${monthlySocialTax.toLocaleString('uz-UZ')} UZS/oy)`;
      break;
    }
    case 'fixed_tax': {
      ratePercent = 0;
      calculatedTaxAmount = profile.fixedMonthlyAmount || UZBEKISTAN_TAX_CONFIG.FIXED_TAX_DEFAULT_ESTIMATE_UZS;
      formulaDescription = `Qatʼiy belgilangan oylik to‘lov: ${calculatedTaxAmount.toLocaleString('uz-UZ')} UZS`;
      break;
    }
    case 'social_tax': {
      ratePercent = profile.customRatePercent || 12;
      calculatedTaxAmount = Math.round((cleanIncome * ratePercent) / 100);
      formulaDescription = `Ijtimoiy to‘lov (${ratePercent}%): ${cleanIncome.toLocaleString('uz-UZ')} UZS dan = ${calculatedTaxAmount.toLocaleString('uz-UZ')} UZS`;
      break;
    }
    case 'property_tax': {
      ratePercent = profile.customRatePercent || 1.5;
      calculatedTaxAmount = profile.fixedMonthlyAmount || 150000;
      formulaDescription = `Mulk solig‘i oylik taqsimoti: ${calculatedTaxAmount.toLocaleString('uz-UZ')} UZS`;
      break;
    }
    case 'custom':
    default: {
      if (profile.calculationMethod === 'percentage') {
        ratePercent = profile.customRatePercent || 10;
        calculatedTaxAmount = Math.round((cleanIncome * ratePercent) / 100);
        formulaDescription = `${cleanIncome.toLocaleString('uz-UZ')} UZS × ${ratePercent}% = ${calculatedTaxAmount.toLocaleString('uz-UZ')} UZS`;
      } else {
        ratePercent = 0;
        calculatedTaxAmount = profile.fixedMonthlyAmount || profile.allocatedReserveAmount || 0;
        formulaDescription = `Mustaqil belgilangan summa: ${calculatedTaxAmount.toLocaleString('uz-UZ')} UZS`;
      }
      break;
    }
  }

  // To'lanishi kerak bo'lgan summa
  const amountToPay = calculatedTaxAmount;

  const periodLabels: Record<string, string> = {
    monthly: 'Oylik davr',
    quarterly: 'Choraklik davr',
    annual: 'Yillik davr',
  };

  return {
    taxType: profile.taxType,
    profileType: profile.profileType,
    calculationMethod: profile.calculationMethod,
    taxableIncome: cleanIncome,
    ratePercent,
    calculatedTaxAmount,
    amountToPay,
    periodLabel: periodLabels[profile.paymentPeriod] || 'Oylik davr',
    formulaDescription,
    disclaimer: UZBEKISTAN_TAX_CONFIG.DISCLAIMER_TEXT,
    isOfficialSource: false,
  };
}

/**
 * Muddat va statusni hisoblash funksiyasi
 *
 * @param dueDate YYYY-MM-DD
 * @param isPaid to'langanmi
 * @param referenceDateStr solishtirish sanasi (standart: bugungi kun)
 */
export function calculateDeadlineStatus(
  dueDate: string,
  isPaid: boolean,
  referenceDateStr?: string
): {
  status: TaxObligationStatus;
  daysRemaining: number;
  statusLabel: string;
  badgeColorClass: string;
  alertLevel: 'normal' | 'warning' | 'danger' | 'success';
} {
  if (isPaid) {
    return {
      status: 'paid',
      daysRemaining: 0,
      statusLabel: 'To‘langan',
      badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      alertLevel: 'success',
    };
  }

  const today = referenceDateStr ? new Date(referenceDateStr) : new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dueDate);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      status: 'overdue',
      daysRemaining: diffDays,
      statusLabel: `Muddati o‘tgan (${overdueDays} kun)`,
      badgeColorClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      alertLevel: 'danger',
    };
  } else if (diffDays === 0) {
    return {
      status: 'approaching',
      daysRemaining: 0,
      statusLabel: 'Bugun to‘lov kuni!',
      badgeColorClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse',
      alertLevel: 'warning',
    };
  } else if (diffDays <= 7) {
    return {
      status: 'approaching',
      daysRemaining: diffDays,
      statusLabel: `Yaqinlashmoqda (${diffDays} kun qoldi)`,
      badgeColorClass: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
      alertLevel: 'warning',
    };
  } else {
    return {
      status: 'scheduled',
      daysRemaining: diffDays,
      statusLabel: `Rejalashtirilgan (${diffDays} kun qoldi)`,
      badgeColorClass: 'bg-slate-100 text-slate-700 border-slate-200',
      alertLevel: 'normal',
    };
  }
}
