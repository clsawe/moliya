import { MandatoryPayment, TaxObligationStatus, TaxProfile, TaxType } from '../../types';
import { UZBEKISTAN_TAX_CONFIG } from '../../config/taxRatesConfig';

export interface TaxObligation {
  id: string;
  title: string;
  taxType: TaxType;
  amount: number;
  month: string; // YYYY-MM
  dueDate: string; // YYYY-MM-DD
  status: TaxObligationStatus;
  isPaid: boolean;
  paidDate?: string;
  notes?: string;
  isOfficialSource: boolean; // false for local estimation
  sourceDescription: string;
}

export interface TaxBalance {
  totalLiabilities: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  lastSyncDate: string;
  isOfficialConnected: boolean;
  statusMessage: string;
}

export interface TaxDeadlineItem {
  id: string;
  taxType: TaxType;
  title: string;
  dueDate: string;
  amount: number;
  daysRemaining: number;
  status: TaxObligationStatus;
  legalNotice: string;
}

export interface TaxProvider {
  readonly id: string;
  readonly name: string;
  readonly isOfficialSource: boolean;
  readonly isConnected: boolean;
  readonly statusNotice: string;

  /**
   * Retrieve tax obligations for a given month or overall
   */
  getTaxObligations(month?: string): Promise<TaxObligation[]>;

  /**
   * Get balance snapshot of tax liabilities
   */
  getTaxBalance(month?: string): Promise<TaxBalance>;

  /**
   * Get upcoming deadlines and calendar notices
   */
  getTaxDeadlines(month?: string): Promise<TaxDeadlineItem[]>;

  /**
   * Get historical paid taxes
   */
  getTaxHistory(): Promise<TaxObligation[]>;
}

/**
 * Official State Tax Committee (my.soliq.uz) Provider Adapter
 *
 * Designed to cleanly plug into the official state gateway when API access is approved.
 * Current state: explicitly reports disconnected / unavailable.
 * Security constraint: Real API tokens & client secrets will strictly remain server-side.
 */
export class OfficialStateTaxProvider implements TaxProvider {
  readonly id = 'official_soliq_uz';
  readonly name = 'Davlat Soliq Qo‘mitasi (my.soliq.uz)';
  readonly isOfficialSource = true;
  readonly isConnected = false;
  readonly statusNotice = UZBEKISTAN_TAX_CONFIG.OFFICIAL_API_NOTICE;

  async getTaxObligations(): Promise<TaxObligation[]> {
    // Official API is currently not connected; returns empty list
    return [];
  }

  async getTaxBalance(): Promise<TaxBalance> {
    return {
      totalLiabilities: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      lastSyncDate: new Date().toISOString(),
      isOfficialConnected: false,
      statusMessage: this.statusNotice,
    };
  }

  async getTaxDeadlines(): Promise<TaxDeadlineItem[]> {
    return [];
  }

  async getTaxHistory(): Promise<TaxObligation[]> {
    return [];
  }
}

/**
 * Local User & Estimated Tax Provider
 *
 * Operates purely on user-provided profile settings, income data, and official tax rate formulas.
 * Transparently labels all obligations as estimations.
 */
export class LocalUserTaxProvider implements TaxProvider {
  readonly id = 'local_user_tax_provider';
  readonly name = 'Foydalanuvchi hisob-kitobi (Ichki tizim)';
  readonly isOfficialSource = false;
  readonly isConnected = true;
  readonly statusNotice = UZBEKISTAN_TAX_CONFIG.DISCLAIMER_TEXT;

  private mandatoryPayments: MandatoryPayment[];
  private taxProfile: TaxProfile | null;

  constructor(payments: MandatoryPayment[], profile: TaxProfile | null) {
    this.mandatoryPayments = payments;
    this.taxProfile = profile;
  }

  async getTaxObligations(month?: string): Promise<TaxObligation[]> {
    const taxPayments = this.mandatoryPayments.filter(
      (m) => m.category === 'tax' && (!month || m.month === month)
    );

    return taxPayments.map((p) => ({
      id: p.id,
      title: p.name,
      taxType: p.taxType || (this.taxProfile?.taxType ?? 'income_tax'),
      amount: p.amount,
      month: p.month,
      dueDate: p.dueDate,
      status: p.isPaid ? 'paid' : 'scheduled',
      isPaid: p.isPaid,
      paidDate: p.paidDate,
      notes: p.notes,
      isOfficialSource: false,
      sourceDescription: UZBEKISTAN_TAX_CONFIG.DISCLAIMER_TEXT,
    }));
  }

  async getTaxBalance(month?: string): Promise<TaxBalance> {
    const items = await this.getTaxObligations(month);
    const totalLiabilities = items.reduce((acc, cur) => acc + cur.amount, 0);
    const totalPaid = items.filter((i) => i.isPaid).reduce((acc, cur) => acc + cur.amount, 0);
    const totalPending = totalLiabilities - totalPaid;

    return {
      totalLiabilities,
      totalPaid,
      totalPending,
      totalOverdue: 0,
      lastSyncDate: new Date().toISOString(),
      isOfficialConnected: false,
      statusMessage: this.statusNotice,
    };
  }

  async getTaxDeadlines(month?: string): Promise<TaxDeadlineItem[]> {
    const items = await this.getTaxObligations(month);
    return items.map((i) => ({
      id: i.id,
      taxType: i.taxType,
      title: i.title,
      dueDate: i.dueDate,
      amount: i.amount,
      daysRemaining: 0,
      status: i.status,
      legalNotice: UZBEKISTAN_TAX_CONFIG.DISCLAIMER_TEXT,
    }));
  }

  async getTaxHistory(): Promise<TaxObligation[]> {
    const items = await this.getTaxObligations();
    return items.filter((i) => i.isPaid);
  }
}
