export type Language = 'uz' | 'ru' | 'en';

export interface Translations {
  // Navigation
  nav_dashboard: string;
  nav_incomes: string;
  nav_expenses: string;
  nav_goals: string;
  nav_settings: string;
  nav_reports: string;
  app_title: string;
  app_subtitle: string;
  open_menu: string;
  close_menu: string;

  // Subtabs
  subtab_everyday: string;
  subtab_utilities: string;
  subtab_mandatory: string;
  subtab_analytics: string;
  subtab_goals_list: string;
  subtab_goal_planner: string;

  // Summary Cards
  card_net_balance: string;
  card_net_balance_desc: string;
  card_total_income: string;
  card_total_income_desc: string;
  card_total_expenses: string;
  card_total_expenses_desc: string;
  card_safe_to_spend: string;
  card_safe_today: string;
  card_safe_week: string;
  card_safe_month: string;
  card_goal_reserve: string;
  card_goal_reserve_desc: string;
  card_unpaid_bills: string;

  // Action Buttons
  btn_add_income: string;
  btn_add_expense: string;
  btn_add_utility: string;
  btn_add_mandatory: string;
  btn_add_goal: string;
  btn_add_member: string;
  btn_contribute: string;
  btn_pay: string;
  btn_save: string;
  btn_cancel: string;
  btn_delete: string;
  btn_edit: string;
  btn_filter: string;
  btn_all: string;
  btn_export: string;
  btn_import: string;
  btn_clear_all: string;
  btn_load_demo: string;
  btn_mark_paid: string;
  btn_mark_unpaid: string;
  btn_view_details: string;

  // Goal Planner
  planner_title: string;
  planner_subtitle: string;
  planner_goal_name: string;
  planner_target_amount: string;
  planner_saved_amount: string;
  planner_remaining_amount: string;
  planner_deadline_months: string;
  planner_required_monthly: string;
  planner_required_weekly: string;
  planner_required_daily: string;
  planner_status_achievable: string;
  planner_status_shortfall: string;
  planner_summary_text: string;
  planner_advice_extend: string;
  planner_advice_cut_expense: string;
  planner_select_goal: string;
  planner_custom_goal: string;

  // Empty States
  empty_dashboard_title: string;
  empty_dashboard_desc: string;
  empty_incomes_title: string;
  empty_incomes_desc: string;
  empty_expenses_title: string;
  empty_expenses_desc: string;
  empty_utilities_title: string;
  empty_utilities_desc: string;
  empty_mandatory_title: string;
  empty_mandatory_desc: string;
  empty_goals_title: string;
  empty_goals_desc: string;
  empty_upcoming_bills: string;
  empty_recent_transactions: string;

  // Sections
  section_goals_progress: string;
  section_upcoming_bills: string;
  section_recent_transactions: string;
  section_quick_actions: string;
  section_monthly_overview: string;
  section_family_members: string;
  section_tax_profile: string;

  // Settings
  settings_title: string;
  settings_desc: string;
  settings_language: string;
  settings_language_desc: string;
  settings_theme: string;
  settings_theme_desc: string;
  settings_theme_light: string;
  settings_theme_dark: string;
  settings_theme_system: string;
  settings_currency: string;
  settings_currency_desc: string;
  settings_data_management: string;
  settings_data_management_desc: string;
  settings_privacy_note: string;
  settings_export_desc: string;
  settings_import_desc: string;
  settings_demo_desc: string;
  settings_clear_desc: string;
  settings_clear_confirm: string;
  settings_demo_confirm: string;
  settings_import_success: string;
  settings_import_error: string;

  // Common Form Fields
  field_name: string;
  field_amount: string;
  field_date: string;
  field_category: string;
  field_member: string;
  field_notes: string;
  field_due_date: string;
  field_priority: string;
  field_month: string;
  field_account_number: string;
  field_optional: string;
  field_required: string;

  // Status Labels
  status_paid: string;
  status_unpaid: string;
  status_overdue: string;
  status_completed: string;
  status_in_progress: string;
  status_on_track: string;
  status_at_risk: string;

  // Months
  months: string[];

  // App Pillars and Views
  btn_add: string;
  btn_close: string;
  family_title: string;
  family_all: string;
  incomes_empty: string;
  expenses_empty: string;
  goals_empty: string;
  goals_title: string;
  goals_active_title: string;
  goals_list_tab: string;
  goals_planner_tab: string;
  pillar_incomes: string;
  pillar_expenses: string;
  pillar_utilities: string;
  pillar_mandatory: string;
  pillar_balance: string;
  pillar_safe_spend: string;
  pillar_goals: string;
  monthly_allocation: string;
  monthly_balance_desc: string;
  family_members_count: string;
  family_balance: string;
  member_filtered_note: string;
  hero_safe_spend: string;
  hero_safe_spend_desc: string;
  hero_view_goals: string;
  card_safe_today_desc: string;
  card_safe_week_desc: string;
  card_safe_month_desc: string;
  unpaid_bills_alert: string;
  unpaid_bills_desc: string;
  pillar_sources: string;
  pillar_transactions: string;
  pillar_obligations: string;
  pillar_active_goals: string;
  family_breakdown_title: string;
  family_breakdown_desc: string;
  upcoming_payments_title: string;
  upcoming_waiting: string;
  upcoming_payments_desc: string;
  upcoming_safe_reserved: string;
  upcoming_empty: string;
  monthly_balance_title: string;
  monthly_savings_rate: string;
  monthly_outflows_share: string;
}

export const translations: Record<Language, Translations> = {
  uz: {
    nav_dashboard: 'Bosh sahifa',
    nav_incomes: 'Daromadlar',
    nav_expenses: 'Xarajatlar',
    nav_goals: 'Maqsadlar',
    nav_settings: 'Sozlamalar',
    nav_reports: 'Hisobotlar',
    app_title: 'Oila va Shaxsiy Moliya',
    app_subtitle: 'Oila byudjetini rejalashtirish tizimi',
    open_menu: 'Menyuni ochish',
    close_menu: 'Menyuni yopish',

    subtab_everyday: 'Kundalik',
    subtab_utilities: 'Kommunal',
    subtab_mandatory: 'Soliqlar va majburiy',
    subtab_analytics: 'Xarajatlar tahlili',
    subtab_goals_list: 'Maqsadlar',
    subtab_goal_planner: 'Goal Planner',

    card_net_balance: 'Qoldiq mablagʻ',
    card_net_balance_desc: 'Mavjud erkin pul balansi',
    card_total_income: 'Jami daromad',
    card_total_income_desc: 'Bu oy kiritilgan mablagʻlar',
    card_total_expenses: 'Jami xarajatlar',
    card_total_expenses_desc: 'Kundalik, kommunal va soliqlar',
    card_safe_to_spend: 'Xavfsiz sarflash',
    card_safe_today: 'Bugungi kun uchun',
    card_safe_week: 'Hafta uchun',
    card_safe_month: 'Oy oxirigacha',
    card_goal_reserve: 'Maqsadlar zaxirasi',
    card_goal_reserve_desc: 'Maqsadlarga ajratilgan mablagʻ',
    card_unpaid_bills: 'Toʻlanmagan toʻlovlar',

    btn_add_income: 'Daromad qoʻshish',
    btn_add_expense: 'Xarajat qoʻshish',
    btn_add_utility: 'Kommunal toʻlov qoʻshish',
    btn_add_mandatory: 'Soliq yoki majburiy toʻlov',
    btn_add_goal: 'Maqsad yaratish',
    btn_add_member: 'Aʼzo qoʻshish',
    btn_contribute: 'Mablagʻ qoʻshish',
    btn_pay: 'Toʻlash',
    btn_save: 'Saqlash',
    btn_cancel: 'Bekor qilish',
    btn_delete: 'Oʻchirish',
    btn_edit: 'Tahrirlash',
    btn_filter: 'Filtrlash',
    btn_all: 'Barchasi',
    btn_export: 'Zaxira nusxa olish (Eksport)',
    btn_import: 'Zaxiradan tiklash (Import)',
    btn_clear_all: 'Barcha maʼlumotlarni tozalash',
    btn_load_demo: 'Sinov uchun demo maʼlumotlarni yuklash',
    btn_mark_paid: 'Toʻlangan deb belgilash',
    btn_mark_unpaid: 'Toʻlanmagan',
    btn_view_details: 'Batafsil koʻrish',

    planner_title: 'Maqsadlar rejalashtiruvchisi',
    planner_subtitle: 'Haqiqiy daromad va xarajatlar asosida maqsadga erishish hisob-kitobi',
    planner_goal_name: 'Maqsad nomi',
    planner_target_amount: 'Maqsad summasi',
    planner_saved_amount: 'Hozirgi jamgʻarma',
    planner_remaining_amount: 'Yetishmayotgan summa',
    planner_deadline_months: 'Qolgan muddat (oy)',
    planner_required_monthly: 'Oylik zarur ajratma',
    planner_required_weekly: 'Haftalik zarur ajratma',
    planner_required_daily: 'Kunlik zarur ajratma',
    planner_status_achievable: 'Erishish mumkin',
    planner_status_shortfall: 'Mablagʻ yetishmaydi',
    planner_summary_text: 'Bu maqsadga {months} oyda yetish uchun har oy taxminan {amount} soʻm ajratishingiz kerak.',
    planner_advice_extend: 'Muddatni uzaytirish tavsiya etiladi: taxminan {months} oy.',
    planner_advice_cut_expense: 'Xarajatlarni oyiga {amount} soʻmga qisqartirish kerak.',
    planner_select_goal: 'Rejalashtirish uchun maqsadni tanlang',
    planner_custom_goal: 'Yangi maqsadni hisoblab koʻrish',

    empty_dashboard_title: 'Hozircha hech qanday maʼlumot yoʻq',
    empty_dashboard_desc: 'Boshlash uchun birinchi daromadingiz yoki xarajatingizni qoʻshing.',
    empty_incomes_title: 'Daromadlar mavjud emas',
    empty_incomes_desc: 'Ushbu oy uchun hali daromad kiritilmagan. Maosh, biznes yoki boshqa daromadingizni qoʻshing.',
    empty_expenses_title: 'Xarajatlar mavjud emas',
    empty_expenses_desc: 'Ushbu oy uchun hali xarajat kiritilmagan.',
    empty_utilities_title: 'Kommunal toʻlovlar yoʻq',
    empty_utilities_desc: 'Elektr, gaz, suv yoki internet hisoblarini qoʻshing.',
    empty_mandatory_title: 'Majburiy toʻlovlar yoʻq',
    empty_mandatory_desc: 'Soliqlar, sugʻurta yoki kredit toʻlovlarini qoʻshing.',
    empty_goals_title: 'Hozircha maqsadlar yoʻq',
    empty_goals_desc: 'Avtomobil, uy, taʼlim yoki sayohat uchun birinchi moliyaviy maqsadingizni belgilang.',
    empty_upcoming_bills: 'Yaqin kunlarda toʻlanadigan toʻlovlar yoʻq.',
    empty_recent_transactions: 'Oxirgi operatsiyalar roʻyxati boʻsh.',

    section_goals_progress: 'Moliyaviy maqsadlar holati',
    section_upcoming_bills: 'Yaqinlashayotgan toʻlovlar',
    section_recent_transactions: 'Soʻnggi operatsiyalar',
    section_quick_actions: 'Tezkor amallar',
    section_monthly_overview: 'Oylik moliyaviy umumiy koʻrinish',
    section_family_members: 'Oila aʼzolari',
    section_tax_profile: 'Soliq profili',

    settings_title: 'Sozlamalar',
    settings_desc: 'Til, koʻrinish rejimi, valyuta va maʼlumotlar boshqaruvi',
    settings_language: 'Dastur tili',
    settings_language_desc: 'Ilova interfeysi uchun tilni tanlang',
    settings_theme: 'Koʻrinish rejimi',
    settings_theme_desc: 'Yorugʻ yoki qorongʻi interfeys mavzusi',
    settings_theme_light: 'Yorugʻ (Kunduzgi)',
    settings_theme_dark: 'Qorongʻi (Tungi)',
    settings_theme_system: 'Tizim boʻyicha (Avtomatik)',
    settings_currency: 'Asosiy valyuta',
    settings_currency_desc: 'Barcha hisob-kitoblar Oʻzbekiston soʻmida (UZS) yuritiladi',
    settings_data_management: 'Maʼlumotlar xavfsizligi va zaxirasi',
    settings_data_management_desc: 'Barcha maʼlumotlar faqat sizning qurilmangizda xavfsiz saqlanadi',
    settings_privacy_note: 'Ilova hech qanday shaxsiy maʼlumotlaringizni tashqi serverlarga yubormaydi. Internet boʻlmaganda ham 100% ishlaydi.',
    settings_export_desc: 'Barcha maʼlumotlaringizni JSON fayl formatida yuklab oling.',
    settings_import_desc: 'Oldin saqlangan JSON zaxira faylidan maʼlumotlarni qayta tiklang.',
    settings_demo_desc: 'Ilovani sinab koʻrish uchun namunaviy maʼlumotlar toʻplamini yuklang.',
    settings_clear_desc: 'Barcha kiritilgan maʼlumotlarni butunlay oʻchirib tashlash.',
    settings_clear_confirm: 'Haqiqatan ham barcha maʼlumotlarni oʻchirmoqchimisiz? Bu amalni bekor qilib boʻlmaydi.',
    settings_demo_confirm: 'Namunaviy sinov maʼlumotlari yuklansinmi? Mavjud maʼlumotlar almashtiriladi.',
    settings_import_success: 'Maʼlumotlar muvaffaqiyatli tiklandi!',
    settings_import_error: 'Faylni oʻqishda xatolik yuz berdi. Iltimos toʻgʻri JSON fayl tanlang.',

    field_name: 'Nomi',
    field_amount: 'Summa (soʻmda)',
    field_date: 'Sana',
    field_category: 'Kategoriya',
    field_member: 'Oila aʼzosi',
    field_notes: 'Qoʻshimcha izoh',
    field_due_date: 'Toʻlov muddati',
    field_priority: 'Muhimlik darajasi',
    field_month: 'Oy',
    field_account_number: 'Hisob / Abonent raqami',
    field_optional: 'ixtiyoriy',
    field_required: 'majburiy',

    status_paid: 'Toʻlangan',
    status_unpaid: 'Toʻlanmagan',
    status_overdue: 'Muddati oʻtgan',
    status_completed: 'Bajarildi',
    status_in_progress: 'Jarayonda',
    status_on_track: 'Reja boʻyicha',
    status_at_risk: 'Xavf ostida',

    months: [
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
    ],

    btn_add: 'Qoʻshish',
    btn_close: 'Yopish',
    family_title: 'Oila aʼzolari',
    family_all: 'Barcha aʼzolar',
    incomes_empty: 'Bu oyda daromadlar kiritilmagan',
    expenses_empty: 'Bu oyda xarajatlar kiritilmagan',
    goals_empty: 'Hozircha maqsadlar kiritilmagan',
    goals_title: 'Moliyaviy maqsadlar',
    goals_active_title: 'Faol maqsadlar',
    goals_list_tab: 'Maqsadlar roʻyxati',
    goals_planner_tab: 'Goal Planner',
    pillar_incomes: 'Daromadlar',
    pillar_expenses: 'Xarajatlar',
    pillar_utilities: 'Kommunal toʻlovlar',
    pillar_mandatory: 'Soliqlar va majburiy toʻlovlar',
    pillar_balance: 'Qoldiq balans',
    pillar_safe_spend: 'Xavfsiz sarflash',
    pillar_goals: 'Maqsadlar',
    monthly_allocation: 'Oylik taqsimot',
    monthly_balance_desc: 'Oylik daromad va chiqimlar tahlili',
    family_members_count: 'aʼzo',
    family_balance: 'Oila balansi',
    member_filtered_note: 'Faqat tanlangan aʼzo maʼlumotlari koʻrsatilmoqda',
    hero_safe_spend: 'Xavfsiz sarflash miqdori',
    hero_safe_spend_desc: 'Majburiyatlar va maqsadlar zaxirasidan keyingi erkin pul',
    hero_view_goals: 'Maqsadlarni koʻrish',
    card_safe_today_desc: 'Kunlik tavsiya etilgan limit',
    card_safe_week_desc: 'Haftalik tavsiya etilgan limit',
    card_safe_month_desc: 'Oylik erkin qoldiq',
    unpaid_bills_alert: 'Kutilayotgan majburiy toʻlovlar mavjud',
    unpaid_bills_desc: 'Toʻlov muddatlarini oʻtkazib yubormaslik uchun ularni oʻz vaqtida toʻlang.',
    pillar_sources: 'manba',
    pillar_transactions: 'tranzaksiya',
    pillar_obligations: 'majburiyat',
    pillar_active_goals: 'faol maqsad',
    family_breakdown_title: 'Oila aʼzolari boʻyicha taqsimot',
    family_breakdown_desc: 'Har bir aʼzoning daromad va xarajatlardagi hissasi',
    upcoming_payments_title: 'Yaqinlashayotgan toʻlovlar',
    upcoming_waiting: 'kutilmoqda',
    upcoming_payments_desc: 'Soliqlar, kommunal va boshqa qatʼiy toʻlovlar',
    upcoming_safe_reserved: 'Safe-to-Spend himoyasi faol',
    upcoming_empty: 'Bu oy uchun toʻlanmagan majburiyatlar yoʻq',
    monthly_balance_title: 'Oylik balans tahlili',
    monthly_savings_rate: 'Jamgʻarma koʻrsatkichi',
    monthly_outflows_share: 'Chiqimlar ulushi',
  },
  ru: {
    nav_dashboard: 'Главная',
    nav_incomes: 'Доходы',
    nav_expenses: 'Расходы',
    nav_goals: 'Цели',
    nav_settings: 'Настройки',
    nav_reports: 'Отчёты',
    app_title: 'Семейные и Личные Финансы',
    app_subtitle: 'Система планирования семейного бюджета',
    open_menu: 'Открыть меню',
    close_menu: 'Закрыть меню',

    subtab_everyday: 'Повседневные',
    subtab_utilities: 'Коммунальные',
    subtab_mandatory: 'Налоги и обязательные',
    subtab_analytics: 'Анализ расходов',
    subtab_goals_list: 'Цели',
    subtab_goal_planner: 'Планировщик целей',

    card_net_balance: 'Остаток средств',
    card_net_balance_desc: 'Свободный доступный баланс',
    card_total_income: 'Общий доход',
    card_total_income_desc: 'Поступления за текущий месяц',
    card_total_expenses: 'Общие расходы',
    card_total_expenses_desc: 'Повседневные, коммунальные и налоги',
    card_safe_to_spend: 'Безопасно потратить',
    card_safe_today: 'На сегодня',
    card_safe_week: 'На неделю',
    card_safe_month: 'До конца месяца',
    card_goal_reserve: 'Резерв целей',
    card_goal_reserve_desc: 'Сумма, зарезервированная под цели',
    card_unpaid_bills: 'Неоплаченные счета',

    btn_add_income: 'Добавить доход',
    btn_add_expense: 'Добавить расход',
    btn_add_utility: 'Добавить коммунальный счёт',
    btn_add_mandatory: 'Добавить налог / платёж',
    btn_add_goal: 'Создать цель',
    btn_add_member: 'Добавить члена семьи',
    btn_contribute: 'Пополнить цель',
    btn_pay: 'Оплатить',
    btn_save: 'Сохранить',
    btn_cancel: 'Отмена',
    btn_delete: 'Удалить',
    btn_edit: 'Редактировать',
    btn_filter: 'Фильтр',
    btn_all: 'Все',
    btn_export: 'Резервная копия (Экспорт)',
    btn_import: 'Восстановление (Импорт)',
    btn_clear_all: 'Очистить все данные',
    btn_load_demo: 'Загрузить демо-данные для теста',
    btn_mark_paid: 'Отметить как оплаченное',
    btn_mark_unpaid: 'Не оплачено',
    btn_view_details: 'Подробнее',

    planner_title: 'Планировщик финансовых целей',
    planner_subtitle: 'Расчёт достижения цели на основе реальных доходов и расходов',
    planner_goal_name: 'Название цели',
    planner_target_amount: 'Сумма цели',
    planner_saved_amount: 'Уже накоплено',
    planner_remaining_amount: 'Осталось накопить',
    planner_deadline_months: 'Срок достижения (месяцев)',
    planner_required_monthly: 'Необходимо откладывать в месяц',
    planner_required_weekly: 'Необходимо откладывать в неделю',
    planner_required_daily: 'Необходимо откладывать в день',
    planner_status_achievable: 'Цель достижима',
    planner_status_shortfall: 'Недостаточно средств',
    planner_summary_text: 'Чтобы достичь этой цели за {months} мес., необходимо откладывать примерно {amount} сум каждый месяц.',
    planner_advice_extend: 'Рекомендуется продлить срок: примерно {months} мес.',
    planner_advice_cut_expense: 'Рекомендуется сократить расходы на {amount} сум в месяц.',
    planner_select_goal: 'Выберите цель для расчёта',
    planner_custom_goal: 'Рассчитать новую цель',

    empty_dashboard_title: 'Пока нет данных',
    empty_dashboard_desc: 'Для начала добавьте первый доход или расход.',
    empty_incomes_title: 'Доходы отсутствуют',
    empty_incomes_desc: 'В этом месяце ещё нет доходов. Добавьте зарплату или другой доход.',
    empty_expenses_title: 'Расходы отсутствуют',
    empty_expenses_desc: 'В этом месяце ещё нет записей о расходах.',
    empty_utilities_title: 'Коммунальные счета отсутствуют',
    empty_utilities_desc: 'Добавьте счета за свет, газ, воду или интернет.',
    empty_mandatory_title: 'Обязательные платежи отсутствуют',
    empty_mandatory_desc: 'Добавьте налоги, страховки или кредиты.',
    empty_goals_title: 'Целей пока нет',
    empty_goals_desc: 'Создайте цель на покупку жилья, авто, образование или путешествие.',
    empty_upcoming_bills: 'Нет предстоящих платежей в ближайшие дни.',
    empty_recent_transactions: 'Список последних операций пуст.',

    section_goals_progress: 'Прогресс финансовых целей',
    section_upcoming_bills: 'Ближайшие платежи',
    section_recent_transactions: 'Последние операции',
    section_quick_actions: 'Быстрые действия',
    section_monthly_overview: 'Обзор за месяц',
    section_family_members: 'Члены семьи',
    section_tax_profile: 'Налоговый профиль',

    settings_title: 'Настройки',
    settings_desc: 'Язык, тема оформления, валюта и управление данными',
    settings_language: 'Язык интерфейса',
    settings_language_desc: 'Выберите удобный язык приложения',
    settings_theme: 'Тема оформления',
    settings_theme_desc: 'Светлая или тёмная цветовая схема',
    settings_theme_light: 'Светлая (Дневная)',
    settings_theme_dark: 'Тёмная (Ночная)',
    settings_theme_system: 'Системная (Авто)',
    settings_currency: 'Основная валюта',
    settings_currency_desc: 'Все расчёты производятся в узбекских сумах (UZS)',
    settings_data_management: 'Безопасность и хранение данных',
    settings_data_management_desc: 'Все данные хранятся исключительно на вашем устройстве',
    settings_privacy_note: 'Приложение работает офлайн без отправки личных данных на внешние серверы.',
    settings_export_desc: 'Скачайте все данные в виде JSON-файла для резервной копии.',
    settings_import_desc: 'Восстановите данные из сохранённого JSON-файла.',
    settings_demo_desc: 'Загрузите тестовые данные для проверки всех функций приложения.',
    settings_clear_desc: 'Полностью удалить все сохранённые данные из памяти.',
    settings_clear_confirm: 'Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.',
    settings_demo_confirm: 'Загрузить тестовые данные? Текущие данные будут заменены.',
    settings_import_success: 'Данные успешно восстановлены!',
    settings_import_error: 'Ошибка при чтении файла. Убедитесь, что выбран корректный JSON-файл.',

    field_name: 'Название',
    field_amount: 'Сумма (в сумах)',
    field_date: 'Дата',
    field_category: 'Категория',
    field_member: 'Член семьи',
    field_notes: 'Примечание',
    field_due_date: 'Срок оплаты',
    field_priority: 'Приоритет',
    field_month: 'Месяц',
    field_account_number: 'Лицевой счёт / абонент',
    field_optional: 'необязательно',
    field_required: 'обязательно',

    status_paid: 'Оплачено',
    status_unpaid: 'Не оплачено',
    status_overdue: 'Просрочено',
    status_completed: 'Завершено',
    status_in_progress: 'В процессе',
    status_on_track: 'По плану',
    status_at_risk: 'Под риском',

    months: [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ],

    btn_add: 'Добавить',
    btn_close: 'Закрыть',
    family_title: 'Члены семьи',
    family_all: 'Все члены семьи',
    incomes_empty: 'В этом месяце доходы не добавлены',
    expenses_empty: 'В этом месяце расходы не добавлены',
    goals_empty: 'Финансовые цели пока не созданы',
    goals_title: 'Финансовые цели',
    goals_active_title: 'Активные цели',
    goals_list_tab: 'Список целей',
    goals_planner_tab: 'Планировщик целей',
    pillar_incomes: 'Доходы',
    pillar_expenses: 'Расходы',
    pillar_utilities: 'Коммунальные платежи',
    pillar_mandatory: 'Налоги и обязательные платежи',
    pillar_balance: 'Остаток средств',
    pillar_safe_spend: 'Безопасно потратить',
    pillar_goals: 'Цели',
    monthly_allocation: 'Ежемесячное распределение',
    monthly_balance_desc: 'Анализ доходов и расходов за месяц',
    family_members_count: 'членов',
    family_balance: 'Семейный баланс',
    member_filtered_note: 'Отображаются данные только выбранного члена семьи',
    hero_safe_spend: 'Безопасная сумма для трат',
    hero_safe_spend_desc: 'Свободные средства после резервирования обязательств и целей',
    hero_view_goals: 'Смотреть цели',
    card_safe_today_desc: 'Рекомендуемый дневной лимит',
    card_safe_week_desc: 'Рекомендуемый недельный лимит',
    card_safe_month_desc: 'Свободный остаток на месяц',
    unpaid_bills_alert: 'Имеются ожидающие обязательные платежи',
    unpaid_bills_desc: 'Оплачивайте своевременно во избежание просрочек.',
    pillar_sources: 'источников',
    pillar_transactions: 'транзакций',
    pillar_obligations: 'обязательств',
    pillar_active_goals: 'активных целей',
    family_breakdown_title: 'Распределение по членам семьи',
    family_breakdown_desc: 'Вклад каждого члена семьи в доходы и расходы',
    upcoming_payments_title: 'Предстоящие платежи',
    upcoming_waiting: 'ожидает',
    upcoming_payments_desc: 'Налоги, коммунальные и фиксированные платежи',
    upcoming_safe_reserved: 'Защита Safe-to-Spend активна',
    upcoming_empty: 'В этом месяце нет неоплаченных обязательств',
    monthly_balance_title: 'Анализ баланса за месяц',
    monthly_savings_rate: 'Показатель накоплений',
    monthly_outflows_share: 'Доля расходов',
  },
  en: {
    nav_dashboard: 'Dashboard',
    nav_incomes: 'Incomes',
    nav_expenses: 'Expenses',
    nav_goals: 'Goals',
    nav_settings: 'Settings',
    nav_reports: 'Reports',
    app_title: 'Family & Personal Finance',
    app_subtitle: 'Family budget planning system',
    open_menu: 'Open menu',
    close_menu: 'Close menu',

    subtab_everyday: 'Everyday',
    subtab_utilities: 'Utilities',
    subtab_mandatory: 'Taxes & Mandatory',
    subtab_analytics: 'Expense Analytics',
    subtab_goals_list: 'Goals',
    subtab_goal_planner: 'Goal Planner',

    card_net_balance: 'Net Balance',
    card_net_balance_desc: 'Available cash balance',
    card_total_income: 'Total Income',
    card_total_income_desc: 'Received funds this month',
    card_total_expenses: 'Total Expenses',
    card_total_expenses_desc: 'Everyday, utilities and mandatory',
    card_safe_to_spend: 'Safe to Spend',
    card_safe_today: 'Daily limit today',
    card_safe_week: 'Weekly limit',
    card_safe_month: 'Monthly remaining',
    card_goal_reserve: 'Goal Reserve',
    card_goal_reserve_desc: 'Allocated toward active goals',
    card_unpaid_bills: 'Unpaid Bills',

    btn_add_income: 'Add Income',
    btn_add_expense: 'Add Expense',
    btn_add_utility: 'Add Utility Bill',
    btn_add_mandatory: 'Add Mandatory Payment',
    btn_add_goal: 'Create Goal',
    btn_add_member: 'Add Member',
    btn_contribute: 'Contribute',
    btn_pay: 'Pay',
    btn_save: 'Save',
    btn_cancel: 'Cancel',
    btn_delete: 'Delete',
    btn_edit: 'Edit',
    btn_filter: 'Filter',
    btn_all: 'All',
    btn_export: 'Backup Data (Export)',
    btn_import: 'Restore Data (Import)',
    btn_clear_all: 'Clear All Data',
    btn_load_demo: 'Load Demo Data for Testing',
    btn_mark_paid: 'Mark as Paid',
    btn_mark_unpaid: 'Unpaid',
    btn_view_details: 'View Details',

    planner_title: 'Goal Financial Planner',
    planner_subtitle: 'Accurate goal planning based on actual income and expenses',
    planner_goal_name: 'Goal Name',
    planner_target_amount: 'Target Amount',
    planner_saved_amount: 'Currently Saved',
    planner_remaining_amount: 'Remaining Needed',
    planner_deadline_months: 'Target Duration (months)',
    planner_required_monthly: 'Required Monthly Saving',
    planner_required_weekly: 'Required Weekly Saving',
    planner_required_daily: 'Required Daily Saving',
    planner_status_achievable: 'Achievable',
    planner_status_shortfall: 'Budget Shortfall',
    planner_summary_text: 'To reach this goal in {months} months, you need to save approx. {amount} UZS each month.',
    planner_advice_extend: 'Suggested timeframe extension: approx. {months} months.',
    planner_advice_cut_expense: 'Suggested expense reduction: {amount} UZS/month.',
    planner_select_goal: 'Select a goal to plan',
    planner_custom_goal: 'Simulate custom goal',

    empty_dashboard_title: 'No Data Yet',
    empty_dashboard_desc: 'Get started by adding your first income or expense.',
    empty_incomes_title: 'No Incomes Added',
    empty_incomes_desc: 'No income records for this month yet. Add your salary or business earnings.',
    empty_expenses_title: 'No Expenses Added',
    empty_expenses_desc: 'No everyday expenses recorded for this month.',
    empty_utilities_title: 'No Utility Bills',
    empty_utilities_desc: 'Add your electricity, gas, water or internet bills.',
    empty_mandatory_title: 'No Mandatory Payments',
    empty_mandatory_desc: 'Add taxes, insurance or loan obligations.',
    empty_goals_title: 'No Financial Goals',
    empty_goals_desc: 'Create your first goal for a vehicle, home, education, or travel.',
    empty_upcoming_bills: 'No upcoming bills due in the near future.',
    empty_recent_transactions: 'Recent transactions list is empty.',

    section_goals_progress: 'Financial Goals Progress',
    section_upcoming_bills: 'Upcoming Payments',
    section_recent_transactions: 'Recent Operations',
    section_quick_actions: 'Quick Actions',
    section_monthly_overview: 'Monthly Financial Overview',
    section_family_members: 'Family Members',
    section_tax_profile: 'Tax Profile',

    settings_title: 'Settings',
    settings_desc: 'Language, theme mode, currency and local data management',
    settings_language: 'Interface Language',
    settings_language_desc: 'Select preferred app language',
    settings_theme: 'Display Theme',
    settings_theme_desc: 'Light, dark or follow system setting',
    settings_theme_light: 'Light (Day mode)',
    settings_theme_dark: 'Dark (Night mode)',
    settings_theme_system: 'System (Auto)',
    settings_currency: 'Base Currency',
    settings_currency_desc: 'All calculations are computed in Uzbek Soums (UZS)',
    settings_data_management: 'Data Privacy & Storage',
    settings_data_management_desc: 'All financial data is stored locally and securely on your device',
    settings_privacy_note: 'This app is 100% offline-ready. No sensitive data is transmitted to external servers.',
    settings_export_desc: 'Download all your records as a secure JSON backup file.',
    settings_import_desc: 'Restore your records from a previous JSON backup file.',
    settings_demo_desc: 'Load demo dataset to explore and test all app features.',
    settings_clear_desc: 'Permanently remove all financial data from this device.',
    settings_clear_confirm: 'Are you sure you want to clear all data? This action cannot be undone.',
    settings_demo_confirm: 'Load test demo data? Existing data will be replaced.',
    settings_import_success: 'Data successfully restored!',
    settings_import_error: 'Failed to read file. Please ensure it is a valid JSON backup file.',

    field_name: 'Name',
    field_amount: 'Amount (in UZS)',
    field_date: 'Date',
    field_category: 'Category',
    field_member: 'Family Member',
    field_notes: 'Notes',
    field_due_date: 'Due Date',
    field_priority: 'Priority',
    field_month: 'Month',
    field_account_number: 'Subscriber / Account #',
    field_optional: 'optional',
    field_required: 'required',

    status_paid: 'Paid',
    status_unpaid: 'Unpaid',
    status_overdue: 'Overdue',
    status_completed: 'Completed',
    status_in_progress: 'In Progress',
    status_on_track: 'On Track',
    status_at_risk: 'At Risk',

    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],

    btn_add: 'Add',
    btn_close: 'Close',
    family_title: 'Family Members',
    family_all: 'All Members',
    incomes_empty: 'No incomes recorded for this month',
    expenses_empty: 'No expenses recorded for this month',
    goals_empty: 'No financial goals created yet',
    goals_title: 'Financial Goals',
    goals_active_title: 'Active Goals',
    goals_list_tab: 'Goals List',
    goals_planner_tab: 'Goal Planner',
    pillar_incomes: 'Incomes',
    pillar_expenses: 'Expenses',
    pillar_utilities: 'Utilities',
    pillar_mandatory: 'Mandatory & Taxes',
    pillar_balance: 'Net Balance',
    pillar_safe_spend: 'Safe to Spend',
    pillar_goals: 'Goals',
    monthly_allocation: 'Monthly Allocation',
    monthly_balance_desc: 'Monthly cashflow and balance analysis',
    family_members_count: 'members',
    family_balance: 'Family Balance',
    member_filtered_note: 'Filtered for selected family member only',
    hero_safe_spend: 'Safe-to-Spend Limit',
    hero_safe_spend_desc: 'Discretionary money after mandatory payments and goal reserve',
    hero_view_goals: 'View Goals',
    card_safe_today_desc: 'Recommended daily limit',
    card_safe_week_desc: 'Recommended weekly limit',
    card_safe_month_desc: 'Remaining monthly safe amount',
    unpaid_bills_alert: 'Pending mandatory payments due',
    unpaid_bills_desc: 'Please pay on time to keep your budget on track.',
    pillar_sources: 'sources',
    pillar_transactions: 'transactions',
    pillar_obligations: 'obligations',
    pillar_active_goals: 'active goals',
    family_breakdown_title: 'Family Members Breakdown',
    family_breakdown_desc: 'Share of incomes and expenses across family members',
    upcoming_payments_title: 'Upcoming Payments',
    upcoming_waiting: 'pending',
    upcoming_payments_desc: 'Taxes, utilities and mandatory obligations',
    upcoming_safe_reserved: 'Safe-to-Spend protected',
    upcoming_empty: 'No pending payments for this month',
    monthly_balance_title: 'Monthly Cashflow Breakdown',
    monthly_savings_rate: 'Savings Rate',
    monthly_outflows_share: 'Outflows Share',
  },
};
