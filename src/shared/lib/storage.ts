/**
 * Local storage utilities for the Money Tracker application
 */

import type { Transaction, InstallmentPlan, FinancialState } from '../types';

// Storage keys
export const STORAGE_KEYS = {
  TRANSACTIONS: 'money-tracker-transactions',
  INSTALLMENTS: 'money-tracker-installments',
  FINANCIAL_STATE: 'money-tracker-financial-state',
  SCHEMA_VERSION: 'money-tracker-schema-version',
} as const;

// Current schema version
export const CURRENT_SCHEMA_VERSION = 1;

// Storage error types
export const StorageErrorType = {
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  CORRUPTED_DATA: 'CORRUPTED_DATA',
  UNAVAILABLE: 'UNAVAILABLE',
  PARSE_ERROR: 'PARSE_ERROR',
  MIGRATION_ERROR: 'MIGRATION_ERROR',
} as const;

export type StorageErrorType = typeof StorageErrorType[keyof typeof StorageErrorType];

export class StorageError extends Error {
  public type: StorageErrorType;
  public originalError?: Error;

  constructor(
    type: StorageErrorType,
    message: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
    this.type = type;
    this.originalError = originalError;
  }
}

// Data migration interface
interface MigrationFunction {
  (data: any): any;
}

// Migration registry
const MIGRATIONS: Record<number, MigrationFunction> = {
  // Example migration from version 0 to 1
  1: (data: any) => {
    // Add any necessary data transformations here
    return data;
  },
};

export class StorageService {
  /**
   * Get data from localStorage with error handling and type safety
   */
  static get<T>(key: string): T | null {
    if (!this.isAvailable()) {
      throw new StorageError(
        StorageErrorType.UNAVAILABLE,
        'Local storage is not available'
      );
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }

      const parsed = JSON.parse(item);
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageError(
          StorageErrorType.CORRUPTED_DATA,
          `Corrupted data found for key "${key}"`,
          error
        );
      }
      throw new StorageError(
        StorageErrorType.PARSE_ERROR,
        `Error reading from localStorage for key "${key}"`,
        error as Error
      );
    }
  }

  /**
   * Set data in localStorage with error handling
   */
  static set<T>(key: string, value: T): void {
    if (!this.isAvailable()) {
      throw new StorageError(
        StorageErrorType.UNAVAILABLE,
        'Local storage is not available'
      );
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new StorageError(
          StorageErrorType.QUOTA_EXCEEDED,
          'Local storage quota exceeded',
          error
        );
      }
      throw new StorageError(
        StorageErrorType.PARSE_ERROR,
        `Error writing to localStorage for key "${key}"`,
        error as Error
      );
    }
  }

  /**
   * Remove data from localStorage
   */
  static remove(key: string): void {
    if (!this.isAvailable()) {
      throw new StorageError(
        StorageErrorType.UNAVAILABLE,
        'Local storage is not available'
      );
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(
        StorageErrorType.PARSE_ERROR,
        `Error removing from localStorage for key "${key}"`,
        error as Error
      );
    }
  }

  /**
   * Clear all localStorage data
   */
  static clear(): void {
    if (!this.isAvailable()) {
      throw new StorageError(
        StorageErrorType.UNAVAILABLE,
        'Local storage is not available'
      );
    }

    try {
      localStorage.clear();
    } catch (error) {
      throw new StorageError(
        StorageErrorType.PARSE_ERROR,
        'Error clearing localStorage',
        error as Error
      );
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current schema version
   */
  static getSchemaVersion(): number {
    try {
      return this.get<number>(STORAGE_KEYS.SCHEMA_VERSION) ?? 0;
    } catch {
      return 0;
    }
  }

  /**
   * Set schema version
   */
  static setSchemaVersion(version: number): void {
    this.set(STORAGE_KEYS.SCHEMA_VERSION, version);
  }

  /**
   * Migrate data to current schema version
   */
  static migrateData(): void {
    const currentVersion = this.getSchemaVersion();
    
    if (currentVersion === CURRENT_SCHEMA_VERSION) {
      return; // No migration needed
    }

    try {
      // Apply migrations sequentially
      for (let version = currentVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
        const migration = MIGRATIONS[version];
        if (migration) {
          this.applyMigration(version, migration);
        }
      }

      this.setSchemaVersion(CURRENT_SCHEMA_VERSION);
    } catch (error) {
      throw new StorageError(
        StorageErrorType.MIGRATION_ERROR,
        `Failed to migrate data from version ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`,
        error as Error
      );
    }
  }

  /**
   * Apply a single migration
   */
  private static applyMigration(_version: number, migration: MigrationFunction): void {
    // Migrate transactions
    try {
      const transactions = this.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS);
      if (transactions) {
        const migratedTransactions = migration(transactions);
        this.set(STORAGE_KEYS.TRANSACTIONS, migratedTransactions);
      }
    } catch (error) {
      // Log but don't fail - transactions might not exist yet
    }

    // Migrate installments
    try {
      const installments = this.get<InstallmentPlan[]>(STORAGE_KEYS.INSTALLMENTS);
      if (installments) {
        const migratedInstallments = migration(installments);
        this.set(STORAGE_KEYS.INSTALLMENTS, migratedInstallments);
      }
    } catch (error) {
      // Log but don't fail - installments might not exist yet
    }

    // Migrate financial state
    try {
      const financialState = this.get<FinancialState>(STORAGE_KEYS.FINANCIAL_STATE);
      if (financialState) {
        const migratedFinancialState = migration(financialState);
        this.set(STORAGE_KEYS.FINANCIAL_STATE, migratedFinancialState);
      }
    } catch (error) {
      // Log but don't fail - financial state might not exist yet
    }
  }

  /**
   * Recover from corrupted data by clearing and reinitializing
   */
  static recoverFromCorruption(): void {
    try {
      // Clear all money tracker data
      this.remove(STORAGE_KEYS.TRANSACTIONS);
      this.remove(STORAGE_KEYS.INSTALLMENTS);
      this.remove(STORAGE_KEYS.FINANCIAL_STATE);
      this.remove(STORAGE_KEYS.SCHEMA_VERSION);

      // Set current schema version
      this.setSchemaVersion(CURRENT_SCHEMA_VERSION);
    } catch (error) {
      throw new StorageError(
        StorageErrorType.PARSE_ERROR,
        'Failed to recover from data corruption',
        error as Error
      );
    }
  }

  /**
   * Get all money tracker data for backup/export
   */
  static exportData(): {
    transactions: Transaction[];
    installments: InstallmentPlan[];
    financialState: FinancialState | null;
    schemaVersion: number;
    exportDate: string;
  } {
    return {
      transactions: this.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) ?? [],
      installments: this.get<InstallmentPlan[]>(STORAGE_KEYS.INSTALLMENTS) ?? [],
      financialState: this.get<FinancialState>(STORAGE_KEYS.FINANCIAL_STATE),
      schemaVersion: this.getSchemaVersion(),
      exportDate: new Date().toISOString(),
    };
  }

  /**
   * Import data from backup
   */
  static importData(data: {
    transactions?: Transaction[];
    installments?: InstallmentPlan[];
    financialState?: FinancialState;
    schemaVersion?: number;
  }): void {
    try {
      if (data.transactions) {
        this.set(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      }
      if (data.installments) {
        this.set(STORAGE_KEYS.INSTALLMENTS, data.installments);
      }
      if (data.financialState) {
        this.set(STORAGE_KEYS.FINANCIAL_STATE, data.financialState);
      }
      
      // Ensure we're on the current schema version after import
      this.setSchemaVersion(CURRENT_SCHEMA_VERSION);
      
      // Run migration if needed
      if (data.schemaVersion && data.schemaVersion < CURRENT_SCHEMA_VERSION) {
        this.migrateData();
      }
    } catch (error) {
      throw new StorageError(
        StorageErrorType.PARSE_ERROR,
        'Failed to import data',
        error as Error
      );
    }
  }
}