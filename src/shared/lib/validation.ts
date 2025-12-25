/**
 * Data validation schemas and utilities for the Money Tracker application
 */

import type { 
  Transaction, 
  InstallmentPlan, 
  PaymentObligation, 
  FinancialState,
  ValidationResult,
  InvestmentType
} from '../types';
import { 
  TransactionCategory,
  PaymentObligationType
} from '../types';
import { isValidDate } from './utils';

// Validation constants
const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 1000000;
const MIN_DURATION = 1;
const MAX_DURATION = 360; // 30 years in months
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_NAME_LENGTH = 100;

// Helper validation functions
function isValidAmount(amount: number): boolean {
  return typeof amount === 'number' && 
         !isNaN(amount) && 
         isFinite(amount) && 
         amount >= MIN_AMOUNT && 
         amount <= MAX_AMOUNT;
}

function isValidString(str: string | undefined, maxLength: number = MAX_DESCRIPTION_LENGTH): boolean {
  return typeof str === 'string' && str.trim().length > 0 && str.length <= maxLength;
}

function isValidEnum<T extends Record<string, string>>(value: string, enumObject: T): boolean {
  return Object.values(enumObject).includes(value as T[keyof T]);
}

function isFutureDate(dateString: string): boolean {
  if (!isValidDate(dateString)) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

function isPastOrTodayDate(dateString: string): boolean {
  if (!isValidDate(dateString)) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

// Transaction validation
export function validateTransaction(transaction: Partial<Transaction>): ValidationResult {
  const errors: string[] = [];

  // Required fields validation
  if (!isValidAmount(transaction.amount!)) {
    errors.push(`Amount must be a number between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}`);
  }

  if (!isValidString(transaction.description, MAX_DESCRIPTION_LENGTH)) {
    errors.push(`Description is required and must be less than ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (!transaction.date || !isValidDate(transaction.date)) {
    errors.push('Valid date is required');
  } else if (!isPastOrTodayDate(transaction.date)) {
    errors.push('Transaction date cannot be in the future');
  }

  if (!isValidString(transaction.cardName, MAX_NAME_LENGTH)) {
    errors.push(`Card name is required and must be less than ${MAX_NAME_LENGTH} characters`);
  }

  // Optional fields validation
  if (transaction.category && !Object.values(TransactionCategory).includes(transaction.category as TransactionCategory)) {
    errors.push('Invalid transaction category');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Installment plan validation
export function validateInstallmentPlan(plan: Partial<InstallmentPlan>): ValidationResult {
  const errors: string[] = [];

  // Required fields validation
  if (!isValidString(plan.name, MAX_NAME_LENGTH)) {
    errors.push(`Plan name is required and must be less than ${MAX_NAME_LENGTH} characters`);
  }

  if (!isValidAmount(plan.totalAmount!)) {
    errors.push(`Total amount must be a number between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}`);
  }

  if (!isValidAmount(plan.monthlyPayment!)) {
    errors.push(`Monthly payment must be a number between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}`);
  }

  if (!plan.startDate || !isValidDate(plan.startDate)) {
    errors.push('Valid start date is required');
  }

  if (!plan.duration || 
      typeof plan.duration !== 'number' || 
      !Number.isInteger(plan.duration) ||
      plan.duration < MIN_DURATION || 
      plan.duration > MAX_DURATION) {
    errors.push(`Duration must be an integer between ${MIN_DURATION} and ${MAX_DURATION} months`);
  }

  // Business logic validation
  if (plan.totalAmount && plan.monthlyPayment && plan.duration) {
    const totalPayments = plan.monthlyPayment * plan.duration;
    const difference = Math.abs(totalPayments - plan.totalAmount);
    const tolerance = plan.totalAmount * 0.01; // 1% tolerance
    
    if (difference > tolerance) {
      errors.push('Total amount should approximately equal monthly payment × duration');
    }
  }

  if (plan.monthlyPayment && plan.totalAmount && plan.monthlyPayment > plan.totalAmount) {
    errors.push('Monthly payment cannot exceed total amount');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Payment obligation validation
export function validatePaymentObligation(obligation: Partial<PaymentObligation>): ValidationResult {
  const errors: string[] = [];

  if (!obligation.type || !Object.values(PaymentObligationType).includes(obligation.type as PaymentObligationType)) {
    errors.push('Valid payment obligation type is required');
  }

  if (!isValidAmount(obligation.amount!)) {
    errors.push(`Amount must be a number between $${MIN_AMOUNT} and $${MAX_AMOUNT.toLocaleString()}`);
  }

  if (!obligation.dueDate || !isValidDate(obligation.dueDate)) {
    errors.push('Valid due date is required');
  }

  if (!isValidString(obligation.description, MAX_DESCRIPTION_LENGTH)) {
    errors.push(`Description is required and must be less than ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (typeof obligation.isPaid !== 'boolean') {
    errors.push('Payment status (isPaid) must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Financial state validation
export function validateFinancialState(state: Partial<FinancialState>): ValidationResult {
  const errors: string[] = [];

  if (typeof state.currentBalance !== 'number' || !isFinite(state.currentBalance)) {
    errors.push('Current balance must be a valid number');
  }

  if (typeof state.totalSpending !== 'number' || !isFinite(state.totalSpending) || state.totalSpending < 0) {
    errors.push('Total spending must be a non-negative number');
  }

  if (typeof state.upcomingObligations !== 'number' || !isFinite(state.upcomingObligations) || state.upcomingObligations < 0) {
    errors.push('Upcoming obligations must be a non-negative number');
  }

  if (typeof state.availableForInvestment !== 'number' || !isFinite(state.availableForInvestment)) {
    errors.push('Available for investment must be a valid number');
  }

  if (!state.lastUpdated || !isValidDate(state.lastUpdated)) {
    errors.push('Valid last updated date is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generic validation for required fields
export function validateRequiredFields<T extends Record<string, any>>(
  obj: Partial<T>, 
  requiredFields: (keyof T)[]
): ValidationResult {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push(`${String(field)} is required`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validation schema registry
export const validationSchemas = {
  transaction: validateTransaction,
  installmentPlan: validateInstallmentPlan,
  paymentObligation: validatePaymentObligation,
  financialState: validateFinancialState,
} as const;