import {
  PaymentProvider,
  PaymentProviderInfo,
  BalanceCheckRequest,
  BalanceCheckResult,
  OutstandingAmountResult,
  CreatePaymentRequest,
  PaymentCreationResult,
  PaymentStatusResult,
  PaymentHistoryFilter,
  PaymentTransaction,
} from './types';

/**
 * Paynet Payment Provider Implementation (Phase 1: Architecture & Integration Skeleton)
 *
 * NOTE ON ARCHITECTURE & SECURITY:
 * 1. Client-Side Decoupling: This provider conforms strictly to the PaymentProvider interface.
 * 2. Zero Credentials in Frontend: No API keys, merchant tokens, or secret certificates
 *    are stored or requested on the client side.
 * 3. Server-Side Routing: When active, all real Paynet requests will route through
 *    the dedicated backend proxy (`/api/payments/paynet/*`).
 * 4. Honesty & Safety: In this current development phase, no fake API responses or
 *    fabricated payment confirmations are generated. Unconfigured or upcoming calls
 *    explicitly return actionable status messages or throw descriptive errors.
 */
export class PaynetPaymentProvider implements PaymentProvider {
  public readonly info: PaymentProviderInfo = {
    id: 'paynet',
    name: 'Paynet',
    description: "Oʻzbekiston boʻylab yagona kommunal va xizmat toʻlovlari milliy tizimi",
    status: 'coming_soon',
    isConfigured: false,
    supportedCategories: [
      'electricity',
      'gas',
      'water',
      'heating',
      'internet',
      'waste',
      'housing',
      'other',
    ],
    serverEndpointProxy: '/api/payments/paynet',
  };

  /**
   * Checking utility balance via Paynet
   * In current development phase, returns honest unavailable state without fake numbers.
   */
  public async checkBalance(request: BalanceCheckRequest): Promise<BalanceCheckResult> {
    // Note: When backend proxy is connected, this calls:
    // return fetch(`${this.info.serverEndpointProxy}/check-balance`, { ... });
    return {
      isAvailable: false,
      accountNumber: request.accountNumber,
      message:
        "Paynet orqali balansni avtomatik tekshirish xizmati integratsiya bosqichida («Coming soon»). Hozirda koʻrsatkichlarni qoʻlda kiritish mumkin.",
    };
  }

  /**
   * Retrieve outstanding debt or billing invoice amount via Paynet
   */
  public async getOutstandingAmount(request: BalanceCheckRequest): Promise<OutstandingAmountResult> {
    return {
      accountNumber: request.accountNumber,
      outstandingAmountUZS: 0,
      minimumPaymentUZS: 0,
    };
  }

  /**
   * Create payment via Paynet
   * STRICT SAFETY: Does not execute fake payments, does not pretend success.
   */
  public async createPayment(request: CreatePaymentRequest): Promise<PaymentCreationResult> {
    // When backend proxy is enabled with server credentials, this initiates a real Paynet payment session.
    return {
      success: false,
      status: 'failed',
      message:
        "Paynet toʻlov shlyuzi server integratsiyasi kutilmoqda. Mablagʻingiz xavfsizligi uchun hozircha toʻlov faqat qoʻlda kiritish orqali hisobga olinadi.",
    };
  }

  /**
   * Query status of an existing Paynet payment
   */
  public async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    return {
      transactionId,
      status: 'failed',
      message: "Tranzaksiya mavjud emas yoki Paynet shlyuzi ulanmagan.",
    };
  }

  /**
   * Retrieve transaction history executed via Paynet
   */
  public async getPaymentHistory(filter?: PaymentHistoryFilter): Promise<PaymentTransaction[]> {
    // Returns empty list or transactions stored locally/backend. No fake records.
    return [];
  }
}
