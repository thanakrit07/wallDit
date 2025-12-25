import type { Transaction } from '../../shared/types';
import { generateId } from '../../shared/lib/utils';
import { validateTransaction } from '../../shared/lib/validation';

export const transactionModel = {
  create: (data: Omit<Transaction, 'id' | 'createdAt'>): Transaction => ({
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }),

  validate: (transaction: Partial<Transaction>): string[] => {
    const result = validateTransaction(transaction);
    return result.errors;
  },
};