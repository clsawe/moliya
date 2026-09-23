import { PendingAction } from './types';

// Helper to normalize apostrophes and clean up text for deterministic matching
export function normalizeUzbekText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['‘’’ʻʼ`´\u2018\u2019\u02bb\u02bc\u00b4\u2032]/gu, "'")
    .trim();
}

// Helper to parse numerical amounts from Uzbek natural language
export function parseUzbekAmount(text: string): number | null {
  const normalized = normalizeUzbekText(text).replace(/,/g, ' ');

  // Explicit negative check (e.g. "-50000", "- 50 ming")
  if (/-\s*\d+/.test(normalized)) {
    return null;
  }

  // 1. Check million first ("6 million", "2.5 mln", "2 mln", "2m")
  const millionMatch = normalized.match(/(\d+(?:[.]\d+)?)\s*(?:million|mln|m\b)/i);
  if (millionMatch) {
    const val = parseFloat(millionMatch[1]);
    if (!isNaN(val) && val > 0) return Math.round(val * 1_000_000);
  }

  // 2. Check thousand ("50 ming", "50k")
  const thousandMatch = normalized.match(/(\d+(?:[.]\d+)?)\s*(?:ming|k\b)/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1]);
    if (!isNaN(val) && val > 0) return Math.round(val * 1_000);
  }

  // 3. Check plain numbers ("50000", "50 000")
  const plainMatch = normalized.match(/\b(\d{1,3}(?:\s\d{3})+|\d+)\b/);
  if (plainMatch) {
    const cleaned = plainMatch[1].replace(/\s+/g, '');
    const val = parseInt(cleaned, 10);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
}

// Category matcher for expenses
export function detectExpenseCategory(text: string): string {
  const lower = normalizeUzbekText(text);
  if (
    lower.includes('ovqat') ||
    lower.includes('tushlik') ||
    lower.includes('kechki') ||
    lower.includes('restoran') ||
    lower.includes('kafe') ||
    lower.includes('non') ||
    lower.includes('bozor') ||
    lower.includes('oziq-ovqat')
  ) {
    return 'food';
  }
  if (
    lower.includes('taksi') ||
    lower.includes("yo'l") ||
    lower.includes('yol') ||
    lower.includes('transport') ||
    lower.includes('benzin') ||
    lower.includes('meto') ||
    lower.includes('avtobus')
  ) {
    return 'transport';
  }
  if (lower.includes('uy') || lower.includes('kvartira') || lower.includes('ijara') || lower.includes('remont')) {
    return 'household';
  }
  if (lower.includes('dori') || lower.includes('shifoxona') || lower.includes('doktor') || lower.includes('apteka') || lower.includes('salomatlik')) {
    return 'health';
  }
  if (lower.includes('kiyim') || lower.includes('poyabzal') || lower.includes('shopping') || lower.includes('kiyim-kechak')) {
    return 'clothing';
  }
  if (lower.includes('kommunal') || lower.includes('svet') || lower.includes('gaz') || lower.includes('suv') || lower.includes('chiqindi')) {
    return 'other';
  }
  return 'other';
}

export function parseOfflineIntent(inputText: string): PendingAction {
  const text = inputText.trim();
  const lower = normalizeUzbekText(text);
  const id = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  // 1. SAFETY FIRST: Dangerous actions requiring explicit confirmation
  if (
    lower.includes("o'chir") ||
    lower.includes('ochir') ||
    lower.includes('tozala') ||
    lower.includes("yo'qot") ||
    lower.includes('delete') ||
    lower.includes('remove')
  ) {
    return {
      id,
      type: 'DELETE_ITEM',
      description: `Ma'lumotlarni o‘chirish amali: "${text}"`,
      payload: { query: text },
      requiresConfirmation: true, // Majburiy tasdiqlash
    };
  }

  if (
    lower.includes("o'tkaz") ||
    lower.includes('otkaz') ||
    lower.includes('perevod') ||
    lower.includes('transfer')
  ) {
    const amount = parseUzbekAmount(text);
    return {
      id,
      type: 'TRANSFER_FUNDS',
      description: `${amount ? amount.toLocaleString() + ' so‘m' : ''} hisoblararo mablag‘ o‘tkazmasi`,
      payload: { amount: amount || 0, rawText: text },
      requiresConfirmation: true, // Majburiy tasdiqlash
    };
  }

  // 2. Safe-to-Spend queries (e.g. "Kunlik qancha pul sarflashim mumkin?", "Safe to spend qancha?")
  if (
    lower.includes('sarflashim') ||
    lower.includes('sarflash mumkin') ||
    lower.includes('sarflasam') ||
    lower.includes('sarflasa') ||
    lower.includes('safe to spend') ||
    lower.includes('safe-to-spend') ||
    lower.includes('xavfsiz limit') ||
    lower.includes('kundalik limit')
  ) {
    return {
      id,
      type: 'QUERY_SAFE_TO_SPEND',
      description: 'Xavfsiz sarflash limitini ko‘rsatish',
      payload: {},
      requiresConfirmation: false,
    };
  }

  // 3. Balance queries (e.g. "Qancha pulim qoldi?", "Balansim qancha?", "Qoldiq qancha?")
  if (
    lower.includes('qancha pulim qoldi') ||
    lower.includes('qancha qoldi') ||
    lower.includes('qoldiq') ||
    lower.includes('balans') ||
    lower.includes('hisobim') ||
    lower.includes("jamg'arma") ||
    lower.includes('pulim qancha')
  ) {
    return {
      id,
      type: 'QUERY_BALANCE',
      description: 'Qoldiq va joriy balansni ko‘rsatish',
      payload: {},
      requiresConfirmation: false,
    };
  }

  // 4. Goal creation ("Telefon uchun 6 million maqsad och", "Mashinaga maqsad ochish")
  if (
    lower.includes('maqsad') ||
    lower.includes("yig'ish") ||
    lower.includes("jamg'armoqchiman") ||
    lower.includes('jamgarmoqchiman')
  ) {
    const amount = parseUzbekAmount(text);
    // Extract goal title
    let goalName = 'Yangi maqsad';
    const forMatch = text.match(/([A-Za-z0-9\s'‘’ʻ]+?)\s+(?:uchun)/i);
    if (forMatch && forMatch[1] && forMatch[1].trim().length > 1) {
      goalName = forMatch[1]
        .replace(/yordamchi/gi, '')
        .replace(/\b\d+(?:[.,]\d+)?\s*(?:ming|mln|million|k\b)?/gi, '')
        .trim();
    } else {
      goalName = text
        .replace(/yordamchi/gi, '')
        .replace(/maqsad/gi, '')
        .replace(/och(?:ish)?/gi, '')
        .replace(/qo'sh(?:ish)?/gi, '')
        .replace(/qosh(?:ish)?/gi, '')
        .replace(/uchun/gi, '')
        .replace(/\b\d+(?:[.,]\d+)?\s*(?:ming|mln|million|k\b)?/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (!goalName) goalName = 'Yangi maqsad';
    else goalName = goalName.charAt(0).toUpperCase() + goalName.slice(1);

    return {
      id,
      type: 'ADD_GOAL',
      description: `"${goalName}" uchun ${amount ? amount.toLocaleString() + ' so‘m' : ''} maqsad qo‘shish`,
      payload: {
        title: goalName,
        targetAmount: amount || 0,
      },
      requiresConfirmation: false,
    };
  }

  // 5. Expense addition ("50 ming so'm ovqatga sarfladim", "100000 bozorga ketdi")
  if (
    lower.includes('sarfladim') ||
    lower.includes('ishlatdim') ||
    lower.includes('berdim') ||
    lower.includes('ketdi') ||
    lower.includes("to'ladim") ||
    lower.includes('toladim') ||
    lower.includes('xarajat')
  ) {
    const amount = parseUzbekAmount(text);
    const category = detectExpenseCategory(text);

    let desc = text
      .replace(/yordamchi/gi, '')
      .replace(/sarfladim/gi, '')
      .replace(/ishlatdim/gi, '')
      .replace(/xarajat/gi, '')
      .replace(/ketdi/gi, '')
      .replace(/to['‘’ʻ]?ladim/gi, '')
      .replace(/so['‘’ʻ]?m/gi, '')
      .replace(/\b\d+(?:[.,]\d+)?\s*(?:ming|mln|million|k\b)?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!desc) {
      desc = category !== 'other' ? category.charAt(0).toUpperCase() + category.slice(1) : 'Kundalik xarajat';
    } else {
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    }

    return {
      id,
      type: 'ADD_EXPENSE',
      description: `${amount ? amount.toLocaleString() + ' so‘m' : ''} xarajat (${desc})`,
      payload: {
        amount: amount || 0,
        category,
        description: desc,
      },
      requiresConfirmation: false,
    };
  }

  // 6. Income addition ("2 million maosh oldim", "500 ming daromad keldi")
  if (
    lower.includes('daromad') ||
    lower.includes('oylik') ||
    lower.includes('maosh') ||
    lower.includes('oldim') ||
    lower.includes('tushdi') ||
    lower.includes('keldi') ||
    lower.includes('topdim')
  ) {
    const amount = parseUzbekAmount(text);

    let desc = text
      .replace(/yordamchi/gi, '')
      .replace(/oldim/gi, '')
      .replace(/tushdi/gi, '')
      .replace(/keldi/gi, '')
      .replace(/daromad/gi, '')
      .replace(/so['‘’ʻ]?m/gi, '')
      .replace(/\b\d+(?:[.,]\d+)?\s*(?:ming|mln|million|k\b)?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!desc) {
      desc = 'Daromad';
    } else {
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    }

    return {
      id,
      type: 'ADD_INCOME',
      description: `${amount ? amount.toLocaleString() + ' so‘m' : ''} daromad (${desc})`,
      payload: {
        amount: amount || 0,
        source: desc,
      },
      requiresConfirmation: false,
    };
  }

  // Fallback / Unknown
  return {
    id,
    type: 'UNKNOWN',
    description: 'Noma\'lum buyruq',
    payload: { rawText: text },
    requiresConfirmation: false,
  };
}
