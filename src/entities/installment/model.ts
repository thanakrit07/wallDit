import type { InstallmentPlan } from '../../shared/types';
import { generateId, addMonths } from '../../shared/lib/utils';
import { validateInstallmentPlan } from '../../shared/lib/validation';

export const installmentModel = {
  create: (data: Omit<InstallmentPlan, 'id' | 'createdAt' | 'remainingPayments' | 'nextDueDate'>): InstallmentPlan => ({
    ...data,
    id: generateId(),
    remainingPayments: data.duration,
    nextDueDate: data.startDate,
    createdAt: new Date().toISOString(),
  }),

  validate: (plan: Partial<InstallmentPlan>): string[] => {
    const result = validateInstallmentPlan(plan);
    return result.errors;
  },

  calculateNextPayment: (plan: InstallmentPlan): string => {
    return addMonths(plan.nextDueDate, 1);
  },
};