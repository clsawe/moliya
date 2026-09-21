import {
  MandatoryPayment,
  UtilityBill,
  FinancialGoal,
  AppReminderNotification,
  ReminderTiming,
  TaxProfile,
} from '../../types';
import { calculateDeadlineStatus } from '../../config/taxRatesConfig';

export interface NotificationChannel {
  readonly id: string;
  readonly name: string;
  readonly isEnabled: boolean;
  send(notification: AppReminderNotification): Promise<boolean>;
}

/**
 * In-App UI Notification Channel (Always active)
 */
export class InAppNotificationChannel implements NotificationChannel {
  readonly id = 'in_app';
  readonly name = 'Ilova ichidagi bildirishnomalar (In-App)';
  readonly isEnabled = true;

  async send(): Promise<boolean> {
    // In-app notifications are rendered directly in React UI
    return true;
  }
}

/**
 * Telegram Bot Notification Channel Adapter (Architecture ready)
 * Future expansion: connects to user's Telegram ID via webhook or server bot
 */
export class TelegramNotificationChannel implements NotificationChannel {
  readonly id = 'telegram';
  readonly name = 'Telegram bot xabarnomasi (@MoliyaBot)';
  readonly isEnabled = false; // Prepared for server webhook

  async send(notification: AppReminderNotification): Promise<boolean> {
    console.info('[Telegram Adapter] Ready to dispatch:', notification.title);
    return false;
  }
}

/**
 * Web Push Notification Channel Adapter (Architecture ready)
 */
export class WebPushNotificationChannel implements NotificationChannel {
  readonly id = 'web_push';
  readonly name = 'Brauzer Push xabarnomasi';
  readonly isEnabled = typeof window !== 'undefined' && 'Notification' in window;

  async send(notification: AppReminderNotification): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

/**
 * Reminders Calculation Engine
 *
 * Scans mandatory payments (taxes, insurance, loans) and utility bills
 * against user's reminder configuration (7 kun, 3 kun, 1 kun oldin, deadline kuni).
 */
export function generateUpcomingReminders(
  mandatoryPayments: MandatoryPayment[],
  utilities: UtilityBill[],
  taxProfile: TaxProfile | null,
  referenceDateStr?: string
): AppReminderNotification[] {
  const notifications: AppReminderNotification[] = [];
  const reminderDays: ReminderTiming[] = taxProfile?.reminderDaysBefore || [7, 3, 1, 0];
  const isEnabled = taxProfile?.remindersEnabled ?? true;

  if (!isEnabled) {
    return [];
  }

  // 1. Mandatory Payments & Taxes
  mandatoryPayments
    .filter((m) => !m.isPaid)
    .forEach((m) => {
      const { status, daysRemaining, statusLabel } = calculateDeadlineStatus(
        m.dueDate,
        m.isPaid,
        referenceDateStr
      );

      const isTax = m.category === 'tax';
      const prefix = isTax ? 'Soliq to‘lovi' : 'Majburiy to‘lov';

      // Check if daysRemaining matches any user preference or is overdue/imminent
      const matchesTiming = reminderDays.includes(daysRemaining as ReminderTiming) || daysRemaining <= 0;

      if (matchesTiming || daysRemaining <= 7) {
        let msg = '';
        if (daysRemaining < 0) {
          msg = `${prefix} muddati ${Math.abs(daysRemaining)} kun oldin o‘tgan. Qarz va jarimalardan saqlanish uchun to‘lovni amalga oshiring.`;
        } else if (daysRemaining === 0) {
          msg = `Bugun ${prefix.toLowerCase()}ning so‘nggi to‘lov kuni!`;
        } else {
          msg = `${prefix} to‘loviga ${daysRemaining} kun qoldi (${statusLabel}).`;
        }

        notifications.push({
          id: `notif-man-${m.id}-${daysRemaining}`,
          sourceType: 'tax',
          sourceId: m.id,
          title: `${isTax ? '⚠️ Soliq' : '🛡️ Majburiy to‘lov'}: ${m.name}`,
          amount: m.amount,
          dueDate: m.dueDate,
          daysRemaining,
          status,
          message: msg,
          isRead: false,
          timingTrigger: (daysRemaining in [7, 3, 1, 0] ? daysRemaining : -1) as ReminderTiming | -1,
        });
      }
    });

  // 2. Unpaid Utilities
  utilities
    .filter((u) => !u.isPaid)
    .forEach((u) => {
      const { status, daysRemaining, statusLabel } = calculateDeadlineStatus(
        u.dueDate,
        u.isPaid,
        referenceDateStr
      );

      if (reminderDays.includes(daysRemaining as ReminderTiming) || daysRemaining <= 7) {
        const utilName = u.description || u.category;
        notifications.push({
          id: `notif-ut-${u.id}-${daysRemaining}`,
          sourceType: 'utility',
          sourceId: u.id,
          title: `🟡 Kommunal to‘lov: ${utilName}`,
          amount: u.amount,
          dueDate: u.dueDate,
          daysRemaining,
          status,
          message:
            daysRemaining <= 0
              ? 'Kommunal to‘lov muddati yetib keldi!'
              : `To‘lov muddatiga ${daysRemaining} kun qoldi (${statusLabel}).`,
          isRead: false,
          timingTrigger: (daysRemaining in [7, 3, 1, 0] ? daysRemaining : -1) as ReminderTiming | -1,
        });
      }
    });

  // Sort by urgency (overdue and closest deadlines first)
  return notifications.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
