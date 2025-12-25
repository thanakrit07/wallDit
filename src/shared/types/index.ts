// Enums for financial data
import * as v from "valibot";

export const TransactionCategoriesSchema = v.picklist([
  "food",
  "transportation",
  "entertainment",
  "shopping",
  "utilities",
  "healthcare",
  "other",
]);

export type TransactionCategory = v.InferInput<
  typeof TransactionCategoriesSchema
>;

export const PaymentObligationTypesSchema = v.picklist([
  "credit-card",
  "installment",
]);

export type PaymentObligationType = v.InferInput<
  typeof PaymentObligationTypesSchema
>;

export const InvestmentTypesSchema = v.picklist(["stock", "banking"]);

export type InvestmentType = v.InferInput<typeof InvestmentTypesSchema>;

export const FinancialHealthStatusesSchema = v.picklist([
  "good",
  "warning",
  "critical",
]);

export type FinancialHealthStatus = v.InferInput<
  typeof FinancialHealthStatusesSchema
>;

// Core data interfaces
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO date string
  cardName: string;
  category?: TransactionCategory;
  createdAt: string;
}

export interface InstallmentPlan {
  id: string;
  name: string;
  totalAmount: number;
  monthlyPayment: number;
  startDate: string;
  duration: number; // months
  remainingPayments: number;
  nextDueDate: string;
  createdAt: string;
}

export interface PaymentObligation {
  id: string;
  type: PaymentObligationType;
  amount: number;
  dueDate: string;
  description: string;
  isPaid: boolean;
}

export interface FinancialState {
  currentBalance: number;
  totalSpending: number;
  upcomingObligations: number;
  availableForInvestment: number;
  lastUpdated: string;
}

export interface InvestmentRecommendation {
  type: InvestmentType;
  title: string;
  description: string;
  minimumAmount: number;
  expectedReturn?: string;
}

// Utility types
export type CreateTransactionData = Omit<Transaction, "id" | "createdAt">;
export type UpdateTransactionData = Partial<
  Omit<Transaction, "id" | "createdAt">
>;

export type CreateInstallmentPlanData = Omit<
  InstallmentPlan,
  "id" | "createdAt" | "remainingPayments" | "nextDueDate"
>;
export type UpdateInstallmentPlanData = Partial<
  Omit<InstallmentPlan, "id" | "createdAt">
>;

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type FinancialSummary = {
  totalTransactions: number;
  totalSpending: number;
  activeInstallments: number;
  upcomingPayments: number;
  availableBalance: number;
  healthStatus: FinancialHealthStatus;
};
