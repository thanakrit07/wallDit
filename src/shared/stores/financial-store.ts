import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FinancialState, InvestmentRecommendation, FinancialHealthStatus } from '../types';
import { financialStateModel } from '../../entities/financial-state/model';
import { StorageService, STORAGE_KEYS } from '../lib/storage';

interface FinancialStore {
  currentBalance: number;
  totalSpending: number;
  upcomingObligations: number;
  availableForInvestment: number;
  lastUpdated: string;
  
  // Actions
  setCurrentBalance: (balance: number) => void;
  updateTotalSpending: (spending: number) => void;
  updateUpcomingObligations: (obligations: number) => void;
  calculateAvailableBalance: () => number;
  getInvestmentRecommendations: () => InvestmentRecommendation[];
  getFinancialHealthStatus: () => FinancialHealthStatus;
  getFinancialState: () => FinancialState;
  updateFinancialState: (updates: Partial<FinancialState>) => void;
  
  // Internal actions
  loadFinancialState: () => void;
  recalculateAll: () => void;
}

const INVESTMENT_RECOMMENDATIONS: InvestmentRecommendation[] = [
  {
    type: 'stock',
    title: 'Index Fund Investment',
    description: 'Diversified stock market investment with moderate risk',
    minimumAmount: 1000,
    expectedReturn: '7-10% annually',
  },
  {
    type: 'stock',
    title: 'Growth Stocks',
    description: 'Higher risk, higher potential return stock investments',
    minimumAmount: 2000,
    expectedReturn: '10-15% annually',
  },
  {
    type: 'banking',
    title: 'High-Yield Savings',
    description: 'Safe banking product with guaranteed returns',
    minimumAmount: 500,
    expectedReturn: '4-5% annually',
  },
  {
    type: 'banking',
    title: 'Certificate of Deposit',
    description: 'Fixed-term deposit with guaranteed returns',
    minimumAmount: 1000,
    expectedReturn: '5-6% annually',
  },
];

export const useFinancialStore = create<FinancialStore>()(
  persist(
    (set, get) => ({
      currentBalance: 0,
      totalSpending: 0,
      upcomingObligations: 0,
      availableForInvestment: 0,
      lastUpdated: new Date().toISOString(),

      setCurrentBalance: (balance: number) => {
        set((state) => {
          const newAvailable = balance - state.upcomingObligations;
          return {
            currentBalance: balance,
            availableForInvestment: newAvailable,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      updateTotalSpending: (spending: number) => {
        set({
          totalSpending: spending,
          lastUpdated: new Date().toISOString(),
        });
      },

      updateUpcomingObligations: (obligations: number) => {
        set((state) => {
          const newAvailable = state.currentBalance - obligations;
          return {
            upcomingObligations: obligations,
            availableForInvestment: newAvailable,
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      calculateAvailableBalance: () => {
        const { currentBalance, upcomingObligations } = get();
        return currentBalance - upcomingObligations;
      },

      getInvestmentRecommendations: () => {
        const { availableForInvestment } = get();
        
        // Only recommend investments if we have positive available balance
        if (availableForInvestment <= 0) {
          return [];
        }

        // Filter recommendations based on available amount
        return INVESTMENT_RECOMMENDATIONS.filter(
          (recommendation) => availableForInvestment >= recommendation.minimumAmount
        );
      },

      getFinancialHealthStatus: () => {
        const state = get();
        const financialState: FinancialState = {
          currentBalance: state.currentBalance,
          totalSpending: state.totalSpending,
          upcomingObligations: state.upcomingObligations,
          availableForInvestment: state.availableForInvestment,
          lastUpdated: state.lastUpdated,
        };
        
        return financialStateModel.calculateHealthStatus(financialState);
      },

      getFinancialState: () => {
        const state = get();
        return {
          currentBalance: state.currentBalance,
          totalSpending: state.totalSpending,
          upcomingObligations: state.upcomingObligations,
          availableForInvestment: state.availableForInvestment,
          lastUpdated: state.lastUpdated,
        };
      },

      updateFinancialState: (updates: Partial<FinancialState>) => {
        set((state) => ({
          ...state,
          ...updates,
          lastUpdated: new Date().toISOString(),
        }));
      },

      loadFinancialState: () => {
        try {
          const storedState = StorageService.get<FinancialState>(STORAGE_KEYS.FINANCIAL_STATE);
          if (storedState) {
            set({
              currentBalance: storedState.currentBalance,
              totalSpending: storedState.totalSpending,
              upcomingObligations: storedState.upcomingObligations,
              availableForInvestment: storedState.availableForInvestment,
              lastUpdated: storedState.lastUpdated,
            });
          }
        } catch (error) {
          console.error('Failed to load financial state:', error);
          // Initialize with default values on error
          set({
            currentBalance: 0,
            totalSpending: 0,
            upcomingObligations: 0,
            availableForInvestment: 0,
            lastUpdated: new Date().toISOString(),
          });
        }
      },

      recalculateAll: () => {
        const state = get();
        const newAvailable = state.currentBalance - state.upcomingObligations;
        set({
          availableForInvestment: newAvailable,
          lastUpdated: new Date().toISOString(),
        });
      },
    }),
    {
      name: STORAGE_KEYS.FINANCIAL_STATE,
      partialize: (state) => ({
        currentBalance: state.currentBalance,
        totalSpending: state.totalSpending,
        upcomingObligations: state.upcomingObligations,
        availableForInvestment: state.availableForInvestment,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);