export const APP_CONFIG = {
  name: 'Money Tracker',
  version: '1.0.0',
  storage: {
    keys: {
      transactions: 'money-tracker-transactions',
      installments: 'money-tracker-installments',
      financialState: 'money-tracker-financial-state',
    },
  },
  investment: {
    minimumThreshold: 1000, // Minimum amount to show investment recommendations
  },
  payments: {
    warningDays: 7, // Days before due date to show warnings
    criticalDays: 3, // Days before due date to show critical warnings
  },
} as const;