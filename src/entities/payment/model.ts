import type { PaymentObligation } from '../../shared/types';
import { generateId } from '../../shared/lib/utils';
import { validatePaymentObligation } from '../../shared/lib/validation';

export const paymentModel = {
  create: (data: Omit<PaymentObligation, 'id'>): PaymentObligation => ({
    ...data,
    id: generateId(),
  }),

  validate: (obligation: Partial<PaymentObligation>): string[] => {
    const result = validatePaymentObligation(obligation);
    return result.errors;
  },

  markAsPaid: (obligation: PaymentObligation): PaymentObligation => ({
    ...obligation,
    isPaid: true,
  }),

  markAsUnpaid: (obligation: PaymentObligation): PaymentObligation => ({
    ...obligation,
    isPaid: false,
  }),
};