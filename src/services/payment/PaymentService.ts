import {
  PaymentProvider,
  PaymentProviderInfo,
  PaymentTransaction,
  BalanceCheckRequest,
  BalanceCheckResult,
  OutstandingAmountResult,
  CreatePaymentRequest,
  PaymentCreationResult,
  PaymentStatusResult,
  PaymentHistoryFilter,
} from './types';
import { PaynetPaymentProvider } from './PaynetPaymentProvider';

/**
 * Payment Service (Central Abstraction Layer)
 *
 * Provides a unified API surface for the application to interact with
 * any registered payment provider (Paynet, future providers, etc.)
 *
 * Ensures clean separation of concerns:
 * - UI components talk exclusively to this service, never hardcoding specific provider APIs.
 * - Confirmed payments are tracked safely and accurately.
 * - Only confirmed payments are accounted for in financial calculations.
 */
export class PaymentService {
  private static instance: PaymentService;
  private providers: Map<string, PaymentProvider> = new Map();
  private defaultProviderId: string = 'paynet';

  private constructor() {
    // Register default providers
    const paynet = new PaynetPaymentProvider();
    this.registerProvider(paynet);
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Register a new payment provider
   */
  public registerProvider(provider: PaymentProvider): void {
    this.providers.set(provider.info.id, provider);
  }

  /**
   * List all registered providers and their readiness status
   */
  public getProviders(): PaymentProviderInfo[] {
    return Array.from(this.providers.values()).map((p) => p.info);
  }

  /**
   * Get provider by ID
   */
  public getProvider(id: string): PaymentProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Get default provider (Paynet)
   */
  public getDefaultProvider(): PaymentProvider {
    const provider = this.providers.get(this.defaultProviderId);
    if (!provider) {
      throw new Error(`Standart toʻlov provayderi (${this.defaultProviderId}) topilmadi`);
    }
    return provider;
  }

  /**
   * Check balance through specified or default provider
   */
  public async checkBalance(
    request: BalanceCheckRequest,
    providerId?: string
  ): Promise<BalanceCheckResult> {
    const provider = providerId ? this.getProvider(providerId) : this.getDefaultProvider();
    if (!provider) {
      return {
        isAvailable: false,
        accountNumber: request.accountNumber,
        message: 'Belgilangan toʻlov provayderi mavjud emas',
      };
    }
    return provider.checkBalance(request);
  }

  /**
   * Get outstanding amount through specified or default provider
   */
  public async getOutstandingAmount(
    request: BalanceCheckRequest,
    providerId?: string
  ): Promise<OutstandingAmountResult> {
    const provider = providerId ? this.getProvider(providerId) : this.getDefaultProvider();
    if (!provider) {
      return {
        accountNumber: request.accountNumber,
        outstandingAmountUZS: 0,
      };
    }
    return provider.getOutstandingAmount(request);
  }

  /**
   * Initiate payment through specified or default provider
   */
  public async createPayment(
    request: CreatePaymentRequest,
    providerId?: string
  ): Promise<PaymentCreationResult> {
    const provider = providerId ? this.getProvider(providerId) : this.getDefaultProvider();
    if (!provider) {
      return {
        success: false,
        status: 'failed',
        message: 'Toʻlov tizimi topilmadi',
      };
    }
    return provider.createPayment(request);
  }

  /**
   * Get status of payment
   */
  public async getPaymentStatus(
    transactionId: string,
    providerId?: string
  ): Promise<PaymentStatusResult> {
    const provider = providerId ? this.getProvider(providerId) : this.getDefaultProvider();
    if (!provider) {
      return {
        transactionId,
        status: 'failed',
        message: 'Toʻlov tizimi topilmadi',
      };
    }
    return provider.getPaymentStatus(transactionId);
  }

  /**
   * Retrieve payment history
   */
  public async getPaymentHistory(
    filter?: PaymentHistoryFilter,
    providerId?: string
  ): Promise<PaymentTransaction[]> {
    const provider = providerId ? this.getProvider(providerId) : this.getDefaultProvider();
    if (!provider) return [];
    return provider.getPaymentHistory(filter);
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();
