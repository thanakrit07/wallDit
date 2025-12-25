import type { FinancialState, FinancialHealthStatus } from '../../shared/types';
import { validateFinancialState } from '../../shared/lib/validation';

export const financialStateModel = {
  create: (data: Omit<FinancialState, 'lastUpdated'>): FinancialState => ({
    ...data,
    lastUpdated: new Date().toISOString(),
  }),

  validate: (state: Partial<FinancialState>): string[] => {
    const result = validateFinancialState(state);
    return result.errors;
  },

  calculateHealthStatus: (state: FinancialState): FinancialHealthStatus => {
    const { currentBalance, upcomingObligations, availableForInvestment } = state;
    
    // Critical: negative available balance or can't cover obligations
    if (availableForInvestment < 0 || currentBalance < upcomingObligations) {
      return FinancialHealthStatus.CRITICAL;
    }
    
    // Warning: very low available balance (less than 10% of current balance)
    if (currentBalance > 0 && availableForInvestment < currentBalance * 0.1) {
      return FinancialHealthStatus.WARNING;
    }
    
    // Good: healthy available balance
    return FinancialHealthStatus.GOOD;
  },

  updateBalance: (state: FinancialState, newBalance: number): FinancialState => ({
    ...state,
    currentBalance: newBalance,
    availableForInvestment: newBalance - state.upcomingObligations,
    lastUpdated: new Date().toISOString(),
  }),

  updateObligations: (state: FinancialState, newObligations: number): FinancialState => ({
    ...state,
    upcomingObligations: newObligations,
    availableForInvestment: state.currentBalance - newObligations,
    lastUpdated: new Date().toISOString(),
  }),
};