import { PendingAction, AssistantLanguage } from './types';

// Helper to normalize text across Uzbek, Russian, and English
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['‘’’ʻʼ`´\u2018\u2019\u02bb\u02bc\u00b4\u2032]/gu, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Backwards-compatible alias
export const normalizeUzbekText = normalizeText;

// Universal amount parser (supports Uzbek, Russian, English numbers & suffixes)
export function parseAmount(text: string): number | null {
  const normalized = normalizeText(text).replace(/,/g, ' ');

  // Explicit negative check (e.g. "-50000", "- 50 ming")
  if (/-\s*\d+/.test(normalized)) {
    return null;
  }

  // 1. Million (mln, million, миллион, млн, m)
  const millionMatch = normalized.match(/(\d+(?:[.]\d+)?)\s*(?:million|mln|миллион[а-я]*|млн|m\b)/i);
  if (millionMatch) {
    const val = parseFloat(millionMatch[1]);
    if (!isNaN(val) && val > 0) return Math.round(val * 1_000_000);
  }

  // 2. Thousand (ming, k, тысяч, тыс, thousand)
  const thousandMatch = normalized.match(/(\d+(?:[.]\d+)?)\s*(?:ming|тысяч[а-я]*|тыс\b|thousand|k\b)/i);
  if (thousandMatch) {
    const val = parseFloat(thousandMatch[1]);
    if (!isNaN(val) && val > 0) return Math.round(val * 1_000);
  }

  // 3. Plain numbers (e.g. "50000", "50 000", "200 000")
  const plainMatch = normalized.match(/\b(\d{1,3}(?:\s\d{3})+|\d+)\b/);
  if (plainMatch) {
    const cleaned = plainMatch[1].replace(/\s+/g, '');
    const val = parseInt(cleaned, 10);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
}

// Backwards-compatible alias
export const parseUzbekAmount = parseAmount;

// Family Member detection: Ota, Ona, Bolalar
export function detectFamilyMember(text: string): { id: string; name: string } | null {
  const lower = normalizeText(text);

  // Ota / Папа / Dad
  if (
    /\b(?:ota|otam|otaga|otamga|otam\s+uchun|ota\s+uchun)\b/i.test(lower) ||
    /\b(?:папа|папе|папы|отец|отцу|для\s+папы|для\s+отца)\b/i.test(lower) ||
    /\b(?:father|dad|for\s+dad|for\s+father)\b/i.test(lower)
  ) {
    return { id: 'mem-ota', name: 'Ota' };
  }

  // Ona / Мама / Mom
  if (
    /\b(?:ona|onam|onaga|onamga|onam\s+uchun|ona\s+uchun)\b/i.test(lower) ||
    /\b(?:мама|маме|мамы|мать|матери|для\s+мамы|для\s+матери)\b/i.test(lower) ||
    /\b(?:mother|mom|for\s+mom|for\s+mother)\b/i.test(lower)
  ) {
    return { id: 'mem-ona', name: 'Ona' };
  }

  // Bolalar / Дети / Kids
  if (
    /\b(?:bola|bolalar|bolalarga|bolamga|bolalar\s+uchun|bolam\s+uchun)\b/i.test(lower) ||
    /\b(?:детям|дети|для\s+детей|ребенку|ребенок)\b/i.test(lower) ||
    /\b(?:kid|kids|child|children|for\s+kids|for\s+children)\b/i.test(lower)
  ) {
    return { id: 'mem-bolalar', name: 'Bolalar' };
  }

  return null;
}

// Category matcher for expenses across Uzbek, Russian, English
export function detectExpenseCategory(text: string): string {
  const lower = normalizeText(text);
  if (
    lower.includes('ovqat') ||
    lower.includes('tushlik') ||
    lower.includes('kechki') ||
    lower.includes('restoran') ||
    lower.includes('kafe') ||
    lower.includes('non') ||
    lower.includes('bozor') ||
    lower.includes('oziq-ovqat') ||
    lower.includes('еда') ||
    lower.includes('продукты') ||
    lower.includes('обед') ||
    lower.includes('ужин') ||
    lower.includes('food') ||
    lower.includes('lunch') ||
    lower.includes('dinner') ||
    lower.includes('grocery') ||
    lower.includes('groceries')
  ) {
    return 'food';
  }
  if (
    lower.includes('taksi') ||
    lower.includes("yo'l") ||
    lower.includes('yol') ||
    lower.includes('transport') ||
    lower.includes('benzin') ||
    lower.includes('metro') ||
    lower.includes('avtobus') ||
    lower.includes('дорога') ||
    lower.includes('проезд') ||
    lower.includes('такси') ||
    lower.includes('бензин') ||
    lower.includes('fare') ||
    lower.includes('taxi') ||
    lower.includes('bus') ||
    lower.includes('fuel')
  ) {
    return 'transport';
  }
  if (
    lower.includes('uy') ||
    lower.includes('kvartira') ||
    lower.includes('ijara') ||
    lower.includes('remont') ||
    lower.includes('аренда') ||
    lower.includes('квартира') ||
    lower.includes('жилье') ||
    lower.includes('rent') ||
    lower.includes('housing') ||
    lower.includes('apartment')
  ) {
    return 'household';
  }
  if (
    lower.includes('dori') ||
    lower.includes('shifoxona') ||
    lower.includes('doktor') ||
    lower.includes('apteka') ||
    lower.includes('salomatlik') ||
    lower.includes('лекарства') ||
    lower.includes('аптека') ||
    lower.includes('врач') ||
    lower.includes('medicine') ||
    lower.includes('doctor') ||
    lower.includes('pharmacy') ||
    lower.includes('health')
  ) {
    return 'health';
  }
  if (
    lower.includes('kiyim') ||
    lower.includes('poyabzal') ||
    lower.includes('shopping') ||
    lower.includes('kiyim-kechak') ||
    lower.includes('одежда') ||
    lower.includes('обувь') ||
    lower.includes('шопинг') ||
    lower.includes('clothes') ||
    lower.includes('clothing') ||
    lower.includes('shoes')
  ) {
    return 'clothing';
  }
  if (
    lower.includes('kommunal') ||
    lower.includes('svet') ||
    lower.includes('gaz') ||
    lower.includes('suv') ||
    lower.includes('chiqindi') ||
    lower.includes('internet') ||
    lower.includes('коммуналка') ||
    lower.includes('utility') ||
    lower.includes('utilities')
  ) {
    return 'other';
  }
  return 'other';
}

// Weekday detector for custom weekdays recurrence (1 = Mon ... 7 = Sun)
export function detectWeekdays(text: string): number[] {
  const lower = normalizeText(text);
  const days = new Set<number>();

  // 1: Dushanba / Понедельник / Monday
  if (lower.includes('dushanba') || lower.includes('понедельник') || lower.includes('monday') || lower.includes('mon\b')) {
    days.add(1);
  }
  // 2: Seshanba / Вторник / Tuesday
  if (lower.includes('seshanba') || lower.includes('вторник') || lower.includes('tuesday') || lower.includes('tue\b')) {
    days.add(2);
  }
  // 3: Chorshanba / Среда / Wednesday
  if (lower.includes('chorshanba') || lower.includes('среда') || lower.includes('среду') || lower.includes('wednesday') || lower.includes('wed\b')) {
    days.add(3);
  }
  // 4: Payshanba / Четверг / Thursday
  if (lower.includes('payshanba') || lower.includes('четверг') || lower.includes('thursday') || lower.includes('thu\b')) {
    days.add(4);
  }
  // 5: Juma / Пятница / Friday
  if (lower.includes('juma') || lower.includes('пятниц') || lower.includes('friday') || lower.includes('fri\b')) {
    days.add(5);
  }
  // 6: Shanba / Суббота / Saturday
  if (lower.includes('shanba') || lower.includes('суббот') || lower.includes('saturday') || lower.includes('sat\b')) {
    days.add(6);
  }
  // 7: Yakshanba / Воскресенье / Sunday
  if (lower.includes('yakshanba') || lower.includes('воскресень') || lower.includes('sunday') || lower.includes('sun\b')) {
    days.add(7);
  }

  return Array.from(days).sort();
}

// Month name map for specific date detection
const MONTH_NAMES: Record<string, string> = {
  // Uzbek
  'yanvar': '01', 'fevral': '02', 'mart': '03', 'aprel': '04', 'may': '05', 'iyun': '06',
  'iyul': '07', 'avgust': '08', 'sentabr': '09', 'sentyabr': '09', 'oktabr': '10', 'noyabr': '11', 'dekabr': '12',
  // Russian
  'января': '01', 'январь': '01', 'февраля': '02', 'февраль': '02', 'марта': '03', 'март': '03',
  'апреля': '04', 'апрель': '04', 'мая': '05', 'июня': '06', 'июнь': '06', 'июля': '07', 'июль': '07',
  'августа': '08', 'август': '08', 'сентября': '09', 'сентябрь': '09', 'октября': '10', 'октябрь': '10',
  'ноября': '11', 'ноябрь': '11', 'декабря': '12', 'декабрь': '12',
  // English
  'january': '01', 'jan': '01', 'february': '02', 'feb': '02', 'march': '03', 'mar': '03',
  'april': '04', 'apr': '04', 'june': '06', 'jun': '06', 'july': '07', 'jul': '07',
  'august': '08', 'aug': '08', 'september': '09', 'sep': '09', 'sept': '09',
  'october': '10', 'oct': '10', 'november': '11', 'nov': '11', 'december': '12', 'dec': '12',
};

// Specific date detector (e.g., "25-sentabr", "25 сентября", "September 25")
export function detectSpecificDate(text: string): string | null {
  const lower = normalizeText(text);

  // Pattern A: "25-sentabr", "25 sentabrga", "25 сентября", "25th september"
  const patA = lower.match(/\b(\d{1,2})(?:-?(?:chi|chi|ci|th|st|nd|rd))?\s*[-]?\s*([a-zа-я]+)/i);
  if (patA && patA[1] && patA[2]) {
    const day = parseInt(patA[1], 10);
    const mStr = patA[2].replace(/(?:da|ga|da|de|го)?$/, '');
    const monthNum = MONTH_NAMES[mStr];
    if (day >= 1 && day <= 31 && monthNum) {
      const year = new Date().getFullYear();
      return `${year}-${monthNum}-${String(day).padStart(2, '0')}`;
    }
  }

  // Pattern B: "September 25", "сентябрь 25"
  const patB = lower.match(/\b([a-zа-я]+)\s+(\d{1,2})\b/i);
  if (patB && patB[1] && patB[2]) {
    const monthNum = MONTH_NAMES[patB[1]];
    const day = parseInt(patB[2], 10);
    if (monthNum && day >= 1 && day <= 31) {
      const year = new Date().getFullYear();
      return `${year}-${monthNum}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}

// Recurrence type detector
export function detectRecurrence(text: string): {
  isRecurring: boolean;
  type: 'daily' | 'weekly' | 'custom_weekdays' | 'monthly' | 'specific_date';
  selectedWeekdays?: number[];
  specificDate?: string;
  label: string;
} | null {
  const lower = normalizeText(text);

  // 1. Custom Weekdays (e.g. "Dushanba va juma kunlari")
  const weekdays = detectWeekdays(text);
  if (weekdays.length > 0 && (lower.includes('kunlari') || lower.includes('дни') || lower.includes('days') || lower.includes('va') || lower.includes('и') || lower.includes('and') || weekdays.length > 1)) {
    return {
      isRecurring: true,
      type: 'custom_weekdays',
      selectedWeekdays: weekdays,
      label: 'Tanlangan hafta kunlari',
    };
  }

  // 2. Daily
  if (
    lower.includes('har kuni') ||
    lower.includes('har kun') ||
    lower.includes('kundalik') ||
    lower.includes('каждый день') ||
    lower.includes('ежедневно') ||
    lower.includes('every day') ||
    lower.includes('daily')
  ) {
    return {
      isRecurring: true,
      type: 'daily',
      label: 'Har kuni',
    };
  }

  // 3. Weekly
  if (
    lower.includes('har hafta') ||
    lower.includes('haftalik') ||
    lower.includes('каждую неделю') ||
    lower.includes('еженедельно') ||
    lower.includes('every week') ||
    lower.includes('weekly')
  ) {
    return {
      isRecurring: true,
      type: 'weekly',
      label: 'Haftalik',
    };
  }

  // 4. Monthly
  if (
    lower.includes('har oy') ||
    lower.includes('har oyda') ||
    lower.includes('каждый месяц') ||
    lower.includes('ежемесячно') ||
    lower.includes('every month') ||
    lower.includes('monthly')
  ) {
    return {
      isRecurring: true,
      type: 'monthly',
      label: 'Har oy',
    };
  }

  // 5. Specific Date
  const specDate = detectSpecificDate(text);
  if (specDate) {
    return {
      isRecurring: true,
      type: 'specific_date',
      specificDate: specDate,
      label: `Sana: ${specDate}`,
    };
  }

  return null;
}

// Clean expense name helper
function cleanExpenseName(text: string, category: string): string {
  const cleaned = text
    .replace(/yordamchi/gi, '')
    .replace(/har\s+(?:kuni|kun|hafta|oy|oyda)/gi, '')
    .replace(/kundalik|haftalik|oylik/gi, '')
    .replace(/каждый\s+(?:день|месяц)/gi, '')
    .replace(/каждую\s+неделю|ежедневно|еженедельно|ежемесячно/gi, '')
    .replace(/every\s+(?:day|week|month)|daily|weekly|monthly/gi, '')
    .replace(/sarfladim|ishlatdim|berdim|ketdi|to['‘’ʻ]?ladim/gi, '')
    .replace(/potratil|potratila|oplatil|oplatila|rashod/gi, '')
    .replace(/spent|paid|expense/gi, '')
    .replace(/dushanba|seshanba|chorshanba|payshanba|juma|shanba|yakshanba/gi, '')
    .replace(/понедельник|вторник|среда|четверг|пятница|суббота|воскресенье/gi, '')
    .replace(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/gi, '')
    .replace(/kunlari|дни|days/gi, '')
    .replace(/uchun|dlya|for/gi, '')
    .replace(/qo['‘’ʻ]?sh(?:ish)?/gi, '')
    .replace(/dobav|dobavit/gi, '')
    .replace(/add/gi, '')
    .replace(/ota(?:m)?(?:ga)?|ona(?:m)?(?:ga)?|bolalar(?:ga)?/gi, '')
    .replace(/пап(?:е|а)?|мам(?:е|а)?|дет(?:ям|и)?/gi, '')
    .replace(/dad|father|mom|mother|kids|children/gi, '')
    .replace(/so['‘’ʻ]?m|sum|uzs|сум/gi, '')
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:ming|mln|million|тысяч[а-я]*|тыс|миллион[а-я]*|млн|k\b|m\b)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || cleaned.length < 2) {
    if (category === 'transport') return "Yo'l kira";
    if (category === 'food') return 'Oziq-ovqat';
    if (category === 'household') return 'Uy-ro‘zg‘or';
    if (category === 'health') return 'Salomatlik';
    if (category === 'clothing') return 'Kiyim-kechak';
    return 'Takrorlanuvchi xarajat';
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Main Intent Parser supporting Uzbek, Russian, English
export function parseOfflineIntent(inputText: string, assistantLang: AssistantLanguage = 'uz'): PendingAction {
  const text = inputText.trim();
  const lower = normalizeText(text);
  const id = 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  // 1. SAFETY FIRST: Dangerous actions requiring explicit confirmation
  if (
    lower.includes("o'chir") ||
    lower.includes('ochir') ||
    lower.includes('tozala') ||
    lower.includes("yo'qot") ||
    lower.includes('удалить') ||
    lower.includes('удали') ||
    lower.includes('очистить') ||
    lower.includes('стереть') ||
    lower.includes('delete') ||
    lower.includes('remove') ||
    lower.includes('clear')
  ) {
    const desc =
      assistantLang === 'ru'
        ? `Действие удаления данных: "${text}"`
        : assistantLang === 'en'
        ? `Data deletion action: "${text}"`
        : `Ma'lumotlarni o‘chirish amali: "${text}"`;

    return {
      id,
      type: 'DELETE_ITEM',
      description: desc,
      payload: { query: text },
      requiresConfirmation: true,
    };
  }

  // 2. Fund transfers
  if (
    lower.includes("o'tkaz") ||
    lower.includes('otkaz') ||
    lower.includes('perevod') ||
    lower.includes('перевод') ||
    lower.includes('переведи') ||
    lower.includes('transfer')
  ) {
    const amount = parseAmount(text);
    const amountStr = amount ? amount.toLocaleString() : '';
    const desc =
      assistantLang === 'ru'
        ? `${amountStr ? amountStr + ' сум ' : ''}перевод между счетами`
        : assistantLang === 'en'
        ? `${amountStr ? amountStr + ' UZS ' : ''}account fund transfer`
        : `${amountStr ? amountStr + ' so‘m ' : ''}hisoblararo mablag‘ o‘tkazmasi`;

    return {
      id,
      type: 'TRANSFER_FUNDS',
      description: desc,
      payload: { amount: amount || 0, rawText: text },
      requiresConfirmation: true,
    };
  }

  // 3. Safe-to-Spend queries
  if (
    lower.includes('sarflashim') ||
    lower.includes('sarflash mumkin') ||
    lower.includes('sarflasam') ||
    lower.includes('safe to spend') ||
    lower.includes('safe-to-spend') ||
    lower.includes('xavfsiz limit') ||
    lower.includes('kundalik limit') ||
    lower.includes('сколько можно тратить') ||
    lower.includes('лимит на день') ||
    lower.includes('дневной лимит') ||
    lower.includes('how much can i spend') ||
    lower.includes('daily limit')
  ) {
    return {
      id,
      type: 'QUERY_SAFE_TO_SPEND',
      description:
        assistantLang === 'ru'
          ? 'Показать безопасный лимит расходов'
          : assistantLang === 'en'
          ? 'Show Safe-to-Spend limit'
          : 'Xavfsiz sarflash limitini ko‘rsatish',
      payload: {},
      requiresConfirmation: false,
    };
  }

  // 4. Balance queries
  if (
    lower.includes('qancha pulim qoldi') ||
    lower.includes('qancha qoldi') ||
    lower.includes('qoldiq') ||
    lower.includes('balans') ||
    lower.includes('hisobim') ||
    lower.includes('pulim qancha') ||
    lower.includes('сколько денег осталось') ||
    lower.includes('какой баланс') ||
    lower.includes('остаток') ||
    lower.includes('how much money left') ||
    lower.includes('check balance') ||
    lower.includes('current balance')
  ) {
    return {
      id,
      type: 'QUERY_BALANCE',
      description:
        assistantLang === 'ru'
          ? 'Показать баланс и текущий остаток'
          : assistantLang === 'en'
          ? 'Show balance and available funds'
          : 'Qoldiq va joriy balansni ko‘rsatish',
      payload: {},
      requiresConfirmation: false,
    };
  }

  // 5. Goal creation
  if (
    lower.includes('maqsad') ||
    lower.includes("yig'ish") ||
    lower.includes("jamg'armoqchiman") ||
    lower.includes('цель') ||
    lower.includes('накопить') ||
    lower.includes('goal') ||
    lower.includes('target')
  ) {
    const amount = parseAmount(text);
    let goalName = assistantLang === 'ru' ? 'Новая цель' : assistantLang === 'en' ? 'New goal' : 'Yangi maqsad';
    const forMatch = text.match(/([A-Za-z0-9\s'‘’ʻА-Яа-я]+?)\s+(?:uchun|на|для|for)/i);
    if (forMatch && forMatch[1] && forMatch[1].trim().length > 1) {
      goalName = forMatch[1]
        .replace(/yordamchi/gi, '')
        .replace(/\b\d+(?:[.,]\d+)?\s*(?:ming|mln|million|тыс|млн|k\b)?/gi, '')
        .trim();
    }
    if (!goalName) goalName = assistantLang === 'ru' ? 'Новая цель' : assistantLang === 'en' ? 'New goal' : 'Yangi maqsad';
    else goalName = goalName.charAt(0).toUpperCase() + goalName.slice(1);

    return {
      id,
      type: 'ADD_GOAL',
      description:
        assistantLang === 'ru'
          ? `Создать цель "${goalName}" на сумму ${amount ? amount.toLocaleString() + ' сум' : ''}`
          : assistantLang === 'en'
          ? `Add goal "${goalName}" for ${amount ? amount.toLocaleString() + ' UZS' : ''}`
          : `"${goalName}" uchun ${amount ? amount.toLocaleString() + ' so‘m' : ''} maqsad qo‘shish`,
      payload: {
        title: goalName,
        targetAmount: amount || 0,
      },
      requiresConfirmation: false,
    };
  }

  // 6. RECURRING EXPENSES ("Takrorlanuvchi xarajatlar")
  // Check recurrence indicators first!
  const recurrence = detectRecurrence(text);
  if (recurrence && recurrence.isRecurring) {
    const amount = parseAmount(text);
    const category = detectExpenseCategory(text);
    const member = detectFamilyMember(text);
    const expenseName = cleanExpenseName(text, category);

    // If amount is missing or <= 0, request clarification instead of guessing
    if (!amount || amount <= 0) {
      const askText =
        assistantLang === 'ru'
          ? `Сумма для "${expenseName}" не указана. Пожалуйста, назовите сумму (например: "Каждый день 10 тысяч на дорогу").`
          : assistantLang === 'en'
          ? `Amount for "${expenseName}" was not specified. Please specify the amount (e.g. "Daily 10,000 for transport").`
          : `"${expenseName}" uchun summa ko‘rsatilmadi. Iltimos, miqdorni ayting (masalan: "Har kuni 10 ming so‘m yo‘l kira").`;

      return {
        id,
        type: 'UNKNOWN',
        description: askText,
        payload: { rawText: text, clarificationNeeded: true, message: askText },
        requiresConfirmation: false,
      };
    }

    // Safety: Recurring expenses create future financial commitment -> REQUIRE CONFIRMATION!
    const memberLabel = member ? ` (${member.name})` : '';
    let confirmationQuestion = '';
    if (assistantLang === 'ru') {
      const recLabels: Record<string, string> = {
        daily: 'каждый день',
        weekly: 'каждую неделю',
        custom_weekdays: 'в выбранные дни',
        monthly: 'каждый месяц',
        specific_date: `на ${recurrence.specificDate}`,
      };
      confirmationQuestion = `Запланировать ${recLabels[recurrence.type] || ''} ${amount.toLocaleString()} сум на "${expenseName}"${memberLabel ? ` (Член семьи: ${member?.name})` : ''}?`;
    } else if (assistantLang === 'en') {
      const recLabels: Record<string, string> = {
        daily: 'daily',
        weekly: 'weekly',
        custom_weekdays: 'on selected weekdays',
        monthly: 'monthly',
        specific_date: `on ${recurrence.specificDate}`,
      };
      confirmationQuestion = `Plan ${amount.toLocaleString()} UZS ${recLabels[recurrence.type] || ''} for "${expenseName}"${memberLabel ? ` (Family member: ${member?.name})` : ''}?`;
    } else {
      const recLabels: Record<string, string> = {
        daily: 'Har kuni',
        weekly: 'Har hafta',
        custom_weekdays: 'Tanlangan hafta kunlari',
        monthly: 'Har oy',
        specific_date: `${recurrence.specificDate} sanasida`,
      };
      confirmationQuestion = `${recLabels[recurrence.type] || 'Har kuni'} ${amount.toLocaleString()} so‘m "${expenseName}"${memberLabel ? ` (Oila a'zosi: ${member?.name})` : ''} sifatida rejalashtiraymi?`;
    }

    return {
      id,
      type: 'ADD_RECURRING_EXPENSE',
      description: confirmationQuestion,
      payload: {
        name: expenseName,
        amount,
        category,
        memberId: member ? member.id : null,
        memberName: member ? member.name : null,
        recurrenceType: recurrence.type,
        selectedWeekdays: recurrence.selectedWeekdays,
        specificDate: recurrence.specificDate,
        startDate: new Date().toISOString().split('T')[0],
      },
      requiresConfirmation: true, // Part 7 Safety requirement: requires confirmation before saving!
    };
  }

  // 7. Regular Expense addition ("50 ming ovqatga", "50 тысяч на продукты", "Spent 50000 on food")
  const category = detectExpenseCategory(text);
  const expAmount = parseAmount(text);
  const isDirectExpensePattern =
    (expAmount !== null && expAmount > 0 && category !== 'other') ||
    (expAmount !== null && expAmount > 0 && (lower.includes('на ') || lower.includes('ga ') || lower.includes('ga') || lower.includes('for ') || lower.includes('uchun')));

  if (
    isDirectExpensePattern ||
    lower.includes('sarfladim') ||
    lower.includes('ishlatdim') ||
    lower.includes('berdim') ||
    lower.includes('ketdi') ||
    lower.includes("to'ladim") ||
    lower.includes('toladim') ||
    lower.includes('xarajat') ||
    lower.includes('потратил') ||
    lower.includes('потратила') ||
    lower.includes('оплатил') ||
    lower.includes('расход') ||
    lower.includes('купил') ||
    lower.includes('купила') ||
    lower.includes('продукты') ||
    lower.includes('spent') ||
    lower.includes('bought') ||
    lower.includes('expense') ||
    lower.includes('paid')
  ) {
    const amount = expAmount;
    const member = detectFamilyMember(text);
    const desc = cleanExpenseName(text, category);

    return {
      id,
      type: 'ADD_EXPENSE',
      description:
        assistantLang === 'ru'
          ? `${amount ? amount.toLocaleString() + ' сум' : ''} расход (${desc})${member ? ` [${member.name}]` : ''}`
          : assistantLang === 'en'
          ? `${amount ? amount.toLocaleString() + ' UZS' : ''} expense (${desc})${member ? ` [${member.name}]` : ''}`
          : `${amount ? amount.toLocaleString() + ' so‘m' : ''} xarajat (${desc})${member ? ` [${member.name}]` : ''}`,
      payload: {
        amount: amount || 0,
        category,
        description: desc,
        memberId: member ? member.id : null,
      },
      requiresConfirmation: false,
    };
  }

  // 8. Income addition ("2 million maosh oldim", "Доход 2 миллиона", "Income 2000000 salary")
  if (
    lower.includes('daromad') ||
    lower.includes('oylik') ||
    lower.includes('maosh') ||
    lower.includes('oldim') ||
    lower.includes('tushdi') ||
    lower.includes('keldi') ||
    lower.includes('topdim') ||
    lower.includes('доход') ||
    lower.includes('зарплата') ||
    lower.includes('получил') ||
    lower.includes('получила') ||
    lower.includes('пришло') ||
    lower.includes('income') ||
    lower.includes('salary') ||
    lower.includes('earned')
  ) {
    const amount = parseAmount(text);
    const member = detectFamilyMember(text);
    let desc = text
      .replace(/yordamchi/gi, '')
      .replace(/oldim|tushdi|keldi|topdim|daromad|maosh|oylik/gi, '')
      .replace(/доход|зарплата|получил|получила|пришло/gi, '')
      .replace(/income|salary|earned/gi, '')
      .replace(/ota(?:m)?(?:ga)?|ona(?:m)?(?:ga)?|bolalar(?:ga)?/gi, '')
      .replace(/so['‘’ʻ]?m|sum|uzs|сум/gi, '')
      .replace(/\b\d+(?:[.,]\d+)?\s*(?:ming|mln|million|тыс|млн|k\b)?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!desc) {
      desc = assistantLang === 'ru' ? 'Доход' : assistantLang === 'en' ? 'Income' : 'Daromad';
    } else {
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    }

    return {
      id,
      type: 'ADD_INCOME',
      description:
        assistantLang === 'ru'
          ? `${amount ? amount.toLocaleString() + ' сум' : ''} доход (${desc})${member ? ` [${member.name}]` : ''}`
          : assistantLang === 'en'
          ? `${amount ? amount.toLocaleString() + ' UZS' : ''} income (${desc})${member ? ` [${member.name}]` : ''}`
          : `${amount ? amount.toLocaleString() + ' so‘m' : ''} daromad (${desc})${member ? ` [${member.name}]` : ''}`,
      payload: {
        amount: amount || 0,
        source: desc,
        memberId: member ? member.id : null,
      },
      requiresConfirmation: false,
    };
  }

  // Fallback / Unknown
  const unknownMsg =
    assistantLang === 'ru'
      ? 'Неизвестная команда'
      : assistantLang === 'en'
      ? 'Unknown command'
      : 'Noma\'lum buyruq';

  return {
    id,
    type: 'UNKNOWN',
    description: unknownMsg,
    payload: { rawText: text },
    requiresConfirmation: false,
  };
}
