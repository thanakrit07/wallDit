import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InstallmentPlan, CreateInstallmentPlanData, UpdateInstallmentPlanData, PaymentObligation } from '../types';
import { installmentModel } from '../../entities/installment/model';
import { StorageService, STORAGE_KEYS } from '../lib/storage';
import { addMonths } from '../lib/utils';

interface InstallmentStore {
  installmentPlans: InstallmentPlan[];
  
  // Actions
  addInstallmentPlan: (data: CreateInstallmentPlanData) => void;
  updateInstallmentPlan: (id: string, updates: UpdateInstallmentPlanData) => void;
  deleteInstallmentPlan: (id: string) => void;
  markPaymentComplete: (planId: string) => void;
  getUpcomingPayments: (days: number) => PaymentObligation[];
  getTotalUpcomingObligations: (days?: number) => number;
  getActivePlans: () => InstallmentPlan[];
  
  // Internal actions
  setInstallmentPlans: (plans: InstallmentPlan[]) => void;
  loadInstallmentPlans: () => void;
}

export const useInstallmentStore = create<InstallmentStore>()(
  persist(
    (set, get) => ({
      installmentPlans: [],

      addInstallmentPlan: (data: CreateInstallmentPlanData) => {
        const errors = installmentModel.validate(data);
        if (errors.length > 0) {
          throw new Error(`Invalid installment plan data: ${errors.join(', ')}`);
        }

        const newPlan = installmentModel.create(data);
        set((state) => ({
          installmentPlans: [...state.installmentPlans, newPlan],
        }));
      },

      updateInstallmentPlan: (id: string, updates: UpdateInstallmentPlanData) => {
        set((state) => ({
          installmentPlans: state.installmentPlans.map((plan) =>
            plan.id === id ? { ...plan, ...updates } : plan
          ),
        }));
      },

      deleteInstallmentPlan: (id: string) => {
        set((state) => ({
          installmentPlans: state.installmentPlans.filter((plan) => plan.id !== id),
        }));
      },

      markPaymentComplete: (planId: string) => {
        set((state) => ({
          installmentPlans: state.installmentPlans.map((plan) => {
            if (plan.id === planId && plan.remainingPayments > 0) {
              const newRemainingPayments = plan.remainingPayments - 1;
              const newNextDueDate = newRemainingPayments > 0 
                ? addMonths(plan.nextDueDate, 1)
                : plan.nextDueDate; // Keep the same date if no more payments
              
              return {
                ...plan,
                remainingPayments: newRemainingPayments,
                nextDueDate: newNextDueDate,
              };
            }
            return plan;
          }),
        }));
      },

      getUpcomingPayments: (days: number) => {
        const { installmentPlans } = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);

        return installmentPlans
          .filter((plan) => plan.remainingPayments > 0)
          .filter((plan) => {
            const dueDate = new Date(plan.nextDueDate);
            return dueDate <= cutoffDate;
          })
          .map((plan) => ({
            id: `installment-${plan.id}`,
            type: 'installment' as const,
            amount: plan.monthlyPayment,
            dueDate: plan.nextDueDate,
            description: `${plan.name} - Installment Payment`,
            isPaid: false,
          }));
      },

      getTotalUpcomingObligations: (days = 30) => {
        const upcomingPayments = get().getUpcomingPayments(days);
        return upcomingPayments.reduce((total, payment) => total + payment.amount, 0);
      },

      getActivePlans: () => {
        const { installmentPlans } = get();
        return installmentPlans.filter((plan) => plan.remainingPayments > 0);
      },

      setInstallmentPlans: (plans: InstallmentPlan[]) => {
        set({ installmentPlans: plans });
      },

      loadInstallmentPlans: () => {
        try {
          const storedPlans = StorageService.get<InstallmentPlan[]>(STORAGE_KEYS.INSTALLMENTS);
          if (storedPlans) {
            set({ installmentPlans: storedPlans });
          }
        } catch (error) {
          console.error('Failed to load installment plans:', error);
          // Initialize with empty array on error
          set({ installmentPlans: [] });
        }
      },
    }),
    {
      name: STORAGE_KEYS.INSTALLMENTS,
      partialize: (state) => ({ installmentPlans: state.installmentPlans }),
    }
  )
);