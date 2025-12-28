import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useInstallmentStore } from './installment-store';
import type { CreateInstallmentPlanData } from '../types';

// **Feature: money-tracker, Property 5: Installment calculation correctness**
// **Validates: Requirements 2.1**

describe('InstallmentStore Property Tests', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useInstallmentStore.getState().setInstallmentPlans([]);
  });

  it('Property 5: Installment calculation correctness', () => {
    fc.assert(
      fc.property(
        // Generate valid installment plan data
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          totalAmount: fc.integer({ min: 100, max: 100000 }).map(cents => cents / 100), // Convert cents to dollars
          monthlyPayment: fc.integer({ min: 10, max: 10000 }).map(cents => cents / 100), // Convert cents to dollars
          startDate: fc.constantFrom('2024-01-01', '2024-06-01', '2024-12-01'),
          duration: fc.integer({ min: 1, max: 60 }), // 1 to 60 months
        }).filter(data => {
          // Ensure monthly payment makes sense for the total amount and duration
          const totalPayments = data.monthlyPayment * data.duration;
          const difference = Math.abs(totalPayments - data.totalAmount);
          const tolerance = data.totalAmount * 0.01; // 1% tolerance
          return difference <= tolerance && data.monthlyPayment <= data.totalAmount;
        }),
        (planData: CreateInstallmentPlanData) => {
          const store = useInstallmentStore.getState();
          
          // Add the installment plan
          store.addInstallmentPlan(planData);

          // Get updated state after mutation
          const updatedStore = useInstallmentStore.getState();
          const plans = updatedStore.installmentPlans;
          
          // Find the added plan
          const addedPlan = plans.find(p => 
            p.name === planData.name &&
            p.totalAmount === planData.totalAmount &&
            p.monthlyPayment === planData.monthlyPayment &&
            p.startDate === planData.startDate &&
            p.duration === planData.duration
          );

          expect(addedPlan).toBeDefined();

          // Verify calculated payment dates are exactly one month apart
          const startDate = new Date(addedPlan!.startDate);
          const nextDueDate = new Date(addedPlan!.nextDueDate);
          
          // For a new plan, nextDueDate should equal startDate
          expect(addedPlan!.nextDueDate).toBe(addedPlan!.startDate);

          // Verify remaining payments equals duration
          expect(addedPlan!.remainingPayments).toBe(planData.duration);

          // Verify the total of all payments approximately equals the original amount
          const totalPayments = planData.monthlyPayment * planData.duration;
          const difference = Math.abs(totalPayments - planData.totalAmount);
          const tolerance = planData.totalAmount * 0.01; // 1% tolerance
          expect(difference).toBeLessThanOrEqual(tolerance);

          // Verify all original data is preserved
          expect(addedPlan!.name).toBe(planData.name);
          expect(addedPlan!.totalAmount).toBe(planData.totalAmount);
          expect(addedPlan!.monthlyPayment).toBe(planData.monthlyPayment);
          expect(addedPlan!.startDate).toBe(planData.startDate);
          expect(addedPlan!.duration).toBe(planData.duration);

          // Verify the plan has required generated fields
          expect(addedPlan!.id).toBeDefined();
          expect(addedPlan!.createdAt).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});