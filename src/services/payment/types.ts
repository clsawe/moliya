import { UtilityCategory } from '../../types';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface PaymentTransaction {
  id: string;
  providerId: string;
  providerName: string;
  utilityBillId?: string;
  utilityCategory: UtilityCategory;
  accountNumber: string;
  payerPhone?: string;
  amount: number; // in UZS (integer)
  fee: number; // in UZS (integer)
  totalAmount: number; // amount + fee (integer)
  status: PaymentStatus;
  statusDescription?: string;
  referenceNumber?: string;
  createdAt: string; // ISO 8601 string
  completedAt?: string; // ISO 8601 string when confirmed
  paymentMethod?: string;
}

export interface BalanceCheckRequest {
  utilityCategory: UtilityCategory;
  accountNumber: string;
  regionCode?: string;
}

export interface BalanceCheckResult {
  isAvailable: boolean;
  accountNumber: string;
  customerName?: string;
  balanceUZS?: number; // positive = balance, negative = debt
  outstandingAmountUZS?: number;
  lastBillingDate?: string;
  message?: string;
}

export interface OutstandingAmountResult {
  accountNumber: string;
  outstandingAmountUZS: number;
  dueDate?: string;
  minimumPaymentUZS?: number;
}

export interface CreatePaymentRequest {
  utilityBillId?: string;
  utilityCategory: UtilityCategory;
  accountNumber: string;
  amountUZS: number;
  payerPhone?: string;
  idempotencyKey?: string;
}

export interface PaymentCreationResult {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  redirectUrl?: string;
  message?: string;
  requiresConfirmation?: boolean;
}

export interface PaymentStatusResult {
  transactionId: string;
  status: PaymentStatus;
  confirmedAt?: string;
  referenceNumber?: string;
  message?: string;
}

export interface PaymentHistoryFilter {
  utilityCategory?: UtilityCategory;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
}

export interface PaymentProviderInfo {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  isConfigured: boolean;
  status: 'available' | 'coming_soon' | 'maintenance';
  supportedCategories: UtilityCategory[];
  serverEndpointProxy?: string;
}

/**
 * Generic Payment Provider Interface
 *
 * This abstraction decouples the UI and financial engine from specific
 * payment gateways like Paynet, Click, Payme, or banking APIs.
 *
 * Security Requirements:
 * - Real provider credentials MUST reside purely on the server side (e.g. /api/payments/*).
 * - Client-side code never stores merchant keys or API secrets.
 * - Current phase: returns clear unconfigured/coming-soon states without fake responses.
 */
export interface PaymentProvider {
  readonly info: PaymentProviderInfo;

  /**
   * Check user's account balance for a given utility service
   */
  checkBalance(request: BalanceCheckRequest): Promise<BalanceCheckResult>;

  /**
   * Retrieve outstanding debt or pending billing amount
   */
  getOutstandingAmount(request: BalanceCheckRequest): Promise<OutstandingAmountResult>;

  /**
   * Initiate a payment transaction
   */
  createPayment(request: CreatePaymentRequest): Promise<PaymentCreationResult>;

  /**
   * Poll or query the status of an ongoing or completed transaction
   */
  getPaymentStatus(transactionId: string): Promise<PaymentStatusResult>;

  /**
   * Query historical transactions executed via this provider
   */
  getPaymentHistory(filter?: PaymentHistoryFilter): Promise<PaymentTransaction[]>;
}
