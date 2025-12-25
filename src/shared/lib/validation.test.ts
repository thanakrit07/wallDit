import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  validateTransaction, 
  validateInstallmentPlan, 
  validatePaymentObligation, 
  validateFinancialState 
} from './validation';
import { TransactionCategory, PaymentObligationType } from '../types';

/**
 * Feature: money-tracker, Property 2: Invalid transaction rejection
 * Validates: Requirements 1.2
 */
describe('Data Model Validation Properties', () => {
  describe('Transaction Validation', () => {
    it('should reject transactions with invalid amounts', () => {
      fc.assert(
        fc.property(
          fc.record({
            amount: fc.oneof(
              fc.constant(0),
              fc.constant(-1),
              fc.constant(-100),
              fc.constant(NaN),
              fc.constant(Infinity),
              fc.constant(-Infinity),
              fc.constant(1000001) // Above max amount
            ),
            description: fc.string({ minLength: 1, maxLength: 100 }),
            date: fc.constantFrom('2023-01-01', '2023-06-15', '2024-01-01'),
            cardName: fc.string({ minLength: 1, maxLength: 50 }),
            category: fc.constantFrom(...Object.values(TransactionCategory))
          }),
          (invalidTransaction) => {
            const result = validateTransaction(invalidTransaction);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.toLowerCase().includes('amount'))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject transactions with missing or invalid required fields', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Missing description
            fc.record({
              amount: fc.integer({ min: 1, max: 1000 }),
              description: fc.constantFrom('', '   ', undefined as any),
              date: fc.constantFrom('2023-01-01', '2023-06-15', '2024-01-01'),
              cardName: fc.string({ minLength: 1, maxLength: 50 })
            }),
            // Missing card name
            fc.record({
              amount: fc.integer({ min: 1, max: 1000 }),
              description: fc.string({ minLength: 1, maxLength: 100 }),
              date: fc.constantFrom('2023-01-01', '2023-06-15', '2024-01-01'),
              cardName: fc.constantFrom('', '   ', undefined as any)
            }),
            // Invalid date
            fc.record({
              amount: fc.integer({ min: 1, max: 1000 }),
              description: fc.string({ minLength: 1, maxLength: 100 }),
              date: fc.constantFrom('invalid-date', '', undefined as any),
              cardName: fc.string({ minLength: 1, maxLength: 50 })
            }),
            // Future date
            fc.record({
              amount: fc.integer({ min: 1, max: 1000 }),
              description: fc.string({ minLength: 1, maxLength: 100 }),
              date: fc.constantFrom('2025-12-31', '2026-01-01'), // Future dates
              cardName: fc.string({ minLength: 1, maxLength: 50 })
            })
          ),
          (invalidTransaction) => {
            const result = validateTransaction(invalidTransaction);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid transactions', () => {
      fc.assert(
        fc.property(
          fc.record({
            amount: fc.integer({ min: 1, max: 1000 }),
            description: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            date: fc.constantFrom('2023-01-01', '2023-06-15', '2024-01-01'), // Past dates
            cardName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            category: fc.option(fc.constantFrom(...Object.values(TransactionCategory)))
          }),
          (validTransaction) => {
            const result = validateTransaction(validTransaction);
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Installment Plan Validation', () => {
    it('should reject installment plans with invalid data', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Invalid amounts
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
              totalAmount: fc.constantFrom(0, -1, NaN, Infinity),
              monthlyPayment: fc.integer({ min: 1, max: 1000 }),
              startDate: fc.constantFrom('2023-01-01', '2024-01-01', '2025-01-01'),
              duration: fc.integer({ min: 1, max: 360 })
            }),
            // Invalid duration
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
              totalAmount: fc.integer({ min: 100, max: 10000 }),
              monthlyPayment: fc.integer({ min: 1, max: 1000 }),
              startDate: fc.constantFrom('2023-01-01', '2024-01-01', '2025-01-01'),
              duration: fc.constantFrom(0, -1, 361, 1.5) // Invalid durations
            }),
            // Missing required fields
            fc.record({
              name: fc.constantFrom('', '   ', undefined as any),
              totalAmount: fc.integer({ min: 100, max: 10000 }),
              monthlyPayment: fc.integer({ min: 1, max: 1000 }),
              startDate: fc.constantFrom('2023-01-01', '2024-01-01', '2025-01-01'),
              duration: fc.integer({ min: 1, max: 360 })
            })
          ),
          (invalidPlan) => {
            const result = validateInstallmentPlan(invalidPlan);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid installment plans', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            totalAmount: fc.integer({ min: 100, max: 10000 }),
            monthlyPayment: fc.integer({ min: 10, max: 1000 }),
            startDate: fc.constantFrom('2023-01-01', '2024-01-01', '2025-01-01'),
            duration: fc.integer({ min: 1, max: 360 })
          }).filter(plan => {
            // Ensure monthly payment * duration is approximately equal to total amount (within 1% tolerance)
            const totalPayments = plan.monthlyPayment * plan.duration;
            const difference = Math.abs(totalPayments - plan.totalAmount);
            const tolerance = plan.totalAmount * 0.01;
            return difference <= tolerance && plan.monthlyPayment <= plan.totalAmount;
          }),
          (validPlan) => {
            const result = validateInstallmentPlan(validPlan);
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Payment Obligation Validation', () => {
    it('should reject payment obligations with invalid data', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Invalid type
            fc.record({
              type: fc.constantFrom('invalid-type' as any, '' as any, undefined as any),
              amount: fc.integer({ min: 1, max: 1000 }),
              dueDate: fc.constantFrom('2023-01-01', '2024-01-01', '2025-01-01'),
              description: fc.string({ minLength: 1, maxLength: 100 }),
              isPaid: fc.boolean()
            }),
            // Invalid amount
            fc.record({
              type: fc.constantFrom(...Object.values(PaymentObligationType)),
              amount: fc.constantFrom(0, -1, NaN, Infinity),
              dueDate: fc.constantFrom('2023-01-01', '2024-01-01', '2025-01-01'),
              description: fc.string({ minLength: 1, maxLength: 100 }),
              isPaid: fc.boolean()
            }),
            // Missing description
            fc.record({
              type: fc.constantFrom(...Object.values(PaymentObligationType)),
              amount: fc.integer({ min: 1, max: 1000 }),
              dueDate: fc.constantFrom('2023-01-01', '2024-01-01', '2025-01-01'),
              description: fc.constantFrom('', '   ', undefined as any),
              isPaid: fc.boolean()
            })
          ),
          (invalidObligation) => {
            const result = validatePaymentObligation(invalidObligation);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid payment obligations', () => {
      fc.assert(
        fc.property(
          fc.record({
            type: fc.constantFrom(...Object.values(PaymentObligationType)),
            amount: fc.integer({ min: 1, max: 1000 }),
            dueDate: fc.constantFrom('2023-01-01', '2024-01-01', '2025-01-01'),
            description: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            isPaid: fc.boolean()
          }),
          (validObligation) => {
            const result = validatePaymentObligation(validObligation);
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Financial State Validation', () => {
    it('should reject financial states with invalid data', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Invalid numbers
            fc.record({
              currentBalance: fc.constantFrom(NaN, Infinity, -Infinity),
              totalSpending: fc.integer({ min: 0, max: 10000 }),
              upcomingObligations: fc.integer({ min: 0, max: 10000 }),
              availableForInvestment: fc.integer({ min: -1000, max: 10000 }),
              lastUpdated: fc.constantFrom('2023-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')
            }),
            // Negative spending or obligations
            fc.record({
              currentBalance: fc.integer({ min: -1000, max: 10000 }),
              totalSpending: fc.constantFrom(-1, -100),
              upcomingObligations: fc.integer({ min: 0, max: 10000 }),
              availableForInvestment: fc.integer({ min: -1000, max: 10000 }),
              lastUpdated: fc.constantFrom('2023-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')
            }),
            // Invalid date
            fc.record({
              currentBalance: fc.integer({ min: -1000, max: 10000 }),
              totalSpending: fc.integer({ min: 0, max: 10000 }),
              upcomingObligations: fc.integer({ min: 0, max: 10000 }),
              availableForInvestment: fc.integer({ min: -1000, max: 10000 }),
              lastUpdated: fc.constantFrom('invalid-date', '', undefined as any)
            })
          ),
          (invalidState) => {
            const result = validateFinancialState(invalidState);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid financial states', () => {
      fc.assert(
        fc.property(
          fc.record({
            currentBalance: fc.integer({ min: -1000, max: 10000 }),
            totalSpending: fc.integer({ min: 0, max: 10000 }),
            upcomingObligations: fc.integer({ min: 0, max: 10000 }),
            availableForInvestment: fc.integer({ min: -1000, max: 10000 }),
            lastUpdated: fc.constantFrom('2023-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')
          }),
          (validState) => {
            const result = validateFinancialState(validState);
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});