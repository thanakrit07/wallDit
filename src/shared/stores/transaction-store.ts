import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, CreateTransactionData, UpdateTransactionData } from '../types';
import { transactionModel } from '../../entities/transaction/model';
import { StorageService, STORAGE_KEYS } from '../lib/storage';

interface TransactionStore {
  transactions: Transaction[];
  
  // Actions
  addTransaction: (data: CreateTransactionData) => void;
  updateTransaction: (id: string, updates: UpdateTransactionData) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getTotalSpending: () => number;
  getTransactionsByCategory: (category?: string) => Transaction[];
  
  // Internal actions
  setTransactions: (transactions: Transaction[]) => void;
  loadTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (data: CreateTransactionData) => {
        const errors = transactionModel.validate(data);
        if (errors.length > 0) {
          throw new Error(`Invalid transaction data: ${errors.join(', ')}`);
        }

        const newTransaction = transactionModel.create(data);
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
      },

      updateTransaction: (id: string, updates: UpdateTransactionData) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, ...updates }
              : transaction
          ),
        }));
      },

      deleteTransaction: (id: string) => {
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== id),
        }));
      },

      getTransactionsByDateRange: (startDate: string, endDate: string) => {
        const { transactions } = get();
        return transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return transactionDate >= start && transactionDate <= end;
        });
      },

      getTotalSpending: () => {
        const { transactions } = get();
        return transactions.reduce((total, transaction) => total + transaction.amount, 0);
      },

      getTransactionsByCategory: (category?: string) => {
        const { transactions } = get();
        if (!category) return transactions;
        return transactions.filter((transaction) => transaction.category === category);
      },

      setTransactions: (transactions: Transaction[]) => {
        set({ transactions });
      },

      loadTransactions: () => {
        try {
          const storedTransactions = StorageService.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
          if (storedTransactions) {
            set({ transactions: storedTransactions });
          }
        } catch (error) {
          console.error('Failed to load transactions:', error);
          // Initialize with empty array on error
          set({ transactions: [] });
        }
      },
    }),
    {
      name: STORAGE_KEYS.TRANSACTIONS,
      partialize: (state) => ({ transactions: state.transactions }),
    }
  )
);