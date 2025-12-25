import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import {
  StorageService,
  StorageError,
  StorageErrorType,
  STORAGE_KEYS,
  CURRENT_SCHEMA_VERSION,
} from "./storage";
import type { Transaction, InstallmentPlan, FinancialState } from "../types";

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      // Handle special keys that might exist in the prototype chain
      if (key === "constructor" || key === "toString" || key === "valueOf") {
        return null;
      }
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

/**
 * Feature: money-tracker, Property 4: Data persistence round-trip
 * Validates: Requirements 1.4, 6.1, 6.2
 */
describe("Storage Service Properties", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("Data Persistence Round-trip Properties", () => {
    it("should preserve transaction data through save and load cycles", () => {
      return fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              amount: fc.integer({ min: 1, max: 1000000 }),
              description: fc.string({ minLength: 1, maxLength: 200 }),
              date: fc.constantFrom(
                "2020-01-01",
                "2021-06-15",
                "2022-12-31",
                "2023-03-15",
                "2024-09-30"
              ),
              cardName: fc.string({ minLength: 1, maxLength: 100 }),
              category: fc.option(
                fc.constantFrom(
                  "food",
                  "transportation", 
                  "entertainment",
                  "shopping",
                  "utilities",
                  "healthcare",
                  "other"
                ),
                { nil: undefined }
              ),
              createdAt: fc.constantFrom(
                "2020-01-01T00:00:00.000Z",
                "2021-06-15T12:30:00.000Z",
                "2022-12-31T23:59:59.999Z",
                "2023-03-15T08:15:30.000Z",
                "2024-09-30T16:45:00.000Z"
              ),
            }),
            { minLength: 0, maxLength: 100 }
          ),
          (originalTransactions: Transaction[]) => {
            // Save transactions
            StorageService.set(STORAGE_KEYS.TRANSACTIONS, originalTransactions);

            // Load transactions
            const loadedTransactions = StorageService.get<Transaction[]>(
              STORAGE_KEYS.TRANSACTIONS
            );

            // Verify round-trip preservation
            expect(loadedTransactions).toEqual(originalTransactions);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve installment plan data through save and load cycles", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              name: fc.string({ minLength: 1, maxLength: 100 }),
              totalAmount: fc.integer({ min: 100, max: 1000000 }),
              monthlyPayment: fc.integer({ min: 10, max: 50000 }),
              startDate: fc.constantFrom(
                "2020-01-01",
                "2021-06-15",
                "2022-12-31",
                "2023-03-15",
                "2024-09-30",
                "2025-12-31"
              ),
              duration: fc.integer({ min: 1, max: 360 }),
              remainingPayments: fc.integer({ min: 0, max: 360 }),
              nextDueDate: fc.constantFrom(
                "2020-01-01",
                "2021-06-15",
                "2022-12-31",
                "2023-03-15",
                "2024-09-30",
                "2025-12-31"
              ),
              createdAt: fc.constantFrom(
                "2020-01-01T00:00:00.000Z",
                "2021-06-15T12:30:00.000Z",
                "2022-12-31T23:59:59.999Z",
                "2023-03-15T08:15:30.000Z",
                "2024-09-30T16:45:00.000Z"
              ),
            }),
            { minLength: 0, maxLength: 50 }
          ),
          (originalInstallments: InstallmentPlan[]) => {
            // Save installments
            StorageService.set(STORAGE_KEYS.INSTALLMENTS, originalInstallments);

            // Load installments
            const loadedInstallments = StorageService.get<InstallmentPlan[]>(
              STORAGE_KEYS.INSTALLMENTS
            );

            // Verify round-trip preservation
            expect(loadedInstallments).toEqual(originalInstallments);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve financial state data through save and load cycles", () => {
      fc.assert(
        fc.property(
          fc.record({
            currentBalance: fc.integer({ min: -100000, max: 1000000 }),
            totalSpending: fc.integer({ min: 0, max: 1000000 }),
            upcomingObligations: fc.integer({ min: 0, max: 1000000 }),
            availableForInvestment: fc.integer({ min: -100000, max: 1000000 }),
            lastUpdated: fc.constantFrom(
              "2020-01-01T00:00:00.000Z",
              "2021-06-15T12:30:00.000Z",
              "2022-12-31T23:59:59.999Z",
              "2023-03-15T08:15:30.000Z",
              "2024-09-30T16:45:00.000Z"
            ),
          }),
          (originalState: FinancialState) => {
            // Save financial state
            StorageService.set(STORAGE_KEYS.FINANCIAL_STATE, originalState);

            // Load financial state
            const loadedState = StorageService.get<FinancialState>(
              STORAGE_KEYS.FINANCIAL_STATE
            );

            // Verify round-trip preservation
            expect(loadedState).toEqual(originalState);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve complex nested data structures through save and load cycles", () => {
      fc.assert(
        fc.property(
          fc.record({
            transactions: fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                amount: fc.integer({ min: 1, max: 1000000 }),
                description: fc.string({ minLength: 1, maxLength: 200 }),
                date: fc.constantFrom(
                  "2020-01-01",
                  "2021-06-15",
                  "2022-12-31",
                  "2023-03-15",
                  "2024-09-30"
                ),
                cardName: fc.string({ minLength: 1, maxLength: 100 }),
                category: fc.option(
                  fc.constantFrom(
                    "food",
                    "transportation", 
                    "entertainment",
                    "shopping",
                    "utilities",
                    "healthcare",
                    "other"
                  ),
                  { nil: undefined }
                ),
                createdAt: fc.constantFrom(
                  "2020-01-01T00:00:00.000Z",
                  "2021-06-15T12:30:00.000Z",
                  "2022-12-31T23:59:59.999Z",
                  "2023-03-15T08:15:30.000Z",
                  "2024-09-30T16:45:00.000Z"
                ),
              }),
              { minLength: 0, maxLength: 20 }
            ),
            installments: fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                name: fc.string({ minLength: 1, maxLength: 100 }),
                totalAmount: fc.integer({ min: 100, max: 1000000 }),
                monthlyPayment: fc.integer({ min: 10, max: 50000 }),
                startDate: fc.constantFrom(
                  "2020-01-01",
                  "2021-06-15",
                  "2022-12-31",
                  "2023-03-15",
                  "2024-09-30",
                  "2025-12-31"
                ),
                duration: fc.integer({ min: 1, max: 360 }),
                remainingPayments: fc.integer({ min: 0, max: 360 }),
                nextDueDate: fc.constantFrom(
                  "2020-01-01",
                  "2021-06-15",
                  "2022-12-31",
                  "2023-03-15",
                  "2024-09-30",
                  "2025-12-31"
                ),
                createdAt: fc.constantFrom(
                  "2020-01-01T00:00:00.000Z",
                  "2021-06-15T12:30:00.000Z",
                  "2022-12-31T23:59:59.999Z",
                  "2023-03-15T08:15:30.000Z",
                  "2024-09-30T16:45:00.000Z"
                ),
              }),
              { minLength: 0, maxLength: 10 }
            ),
            financialState: fc.record({
              currentBalance: fc.integer({ min: -100000, max: 1000000 }),
              totalSpending: fc.integer({ min: 0, max: 1000000 }),
              upcomingObligations: fc.integer({ min: 0, max: 1000000 }),
              availableForInvestment: fc.integer({
                min: -100000,
                max: 1000000,
              }),
              lastUpdated: fc.constantFrom(
                "2020-01-01T00:00:00.000Z",
                "2021-06-15T12:30:00.000Z",
                "2022-12-31T23:59:59.999Z",
                "2023-03-15T08:15:30.000Z",
                "2024-09-30T16:45:00.000Z"
              ),
            }),
          }),
          (originalData) => {
            // Save all data using export/import functionality
            const exportData = {
              transactions: originalData.transactions,
              installments: originalData.installments,
              financialState: originalData.financialState,
              schemaVersion: CURRENT_SCHEMA_VERSION,
            };

            StorageService.importData(exportData);

            // Load all data using export functionality
            const loadedData = StorageService.exportData();

            // Verify round-trip preservation
            expect(loadedData.transactions).toEqual(originalData.transactions);
            expect(loadedData.installments).toEqual(originalData.installments);
            expect(loadedData.financialState).toEqual(
              originalData.financialState
            );
            expect(loadedData.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle null values correctly in round-trip", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.array(fc.oneof(fc.constant(null), fc.string(), fc.integer()), {
              minLength: 0,
              maxLength: 5,
            }),
            fc.record({
              someField: fc.oneof(fc.constant(null), fc.string(), fc.integer()),
              anotherField: fc.option(fc.string()),
            })
          ),
          (testData) => {
            const testKey = "test-key";

            StorageService.set(testKey, testData);
            const loaded = StorageService.get(testKey);
            expect(loaded).toEqual(testData);

            // Clean up
            StorageService.remove(testKey);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return null for non-existent keys", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((key) => !key.startsWith("money-tracker"))
            .filter(
              (key) =>
                ![
                  "constructor",
                  "toString",
                  "valueOf",
                  "hasOwnProperty",
                  "__proto__",
                  "prototype",
                  "__defineGetter__",
                  "__defineSetter__",
                  "__lookupGetter__",
                  "__lookupSetter__",
                  "isPrototypeOf",
                  "propertyIsEnumerable",
                  "toLocaleString",
                ].includes(key)
            ),
          (randomKey) => {
            const result = StorageService.get(randomKey);
            expect(result).toBe(null);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: money-tracker, Property 12: Error handling for corrupted data
   * Validates: Requirements 6.3
   */
  describe("Error Handling Properties", () => {
    it("should handle corrupted JSON data gracefully", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
            try {
              JSON.parse(s);
              return false; // Skip valid JSON
            } catch {
              return true; // Keep invalid JSON
            }
          }),
          fc.constantFrom(...Object.values(STORAGE_KEYS)),
          (corruptedData, storageKey) => {
            // Manually corrupt the localStorage data
            localStorageMock.setItem(storageKey, corruptedData);

            // Attempt to read the corrupted data
            expect(() => {
              StorageService.get(storageKey);
            }).toThrow(StorageError);

            try {
              StorageService.get(storageKey);
            } catch (error) {
              expect(error).toBeInstanceOf(StorageError);
              expect((error as StorageError).type).toBe(StorageErrorType.CORRUPTED_DATA);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should recover from corrupted data without crashing the application", () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => {
            try {
              JSON.parse(s);
              return false; // Skip valid JSON
            } catch {
              return true; // Keep invalid JSON
            }
          }), { minLength: 1, maxLength: 4 }),
          (corruptedDataArray) => {
            // Corrupt all storage keys
            const keys = Object.values(STORAGE_KEYS);
            corruptedDataArray.forEach((corruptedData, index) => {
              if (index < keys.length) {
                localStorageMock.setItem(keys[index], corruptedData);
              }
            });

            // Recovery should not throw
            expect(() => {
              StorageService.recoverFromCorruption();
            }).not.toThrow();

            // After recovery, all keys should be accessible
            expect(() => {
              StorageService.get(STORAGE_KEYS.TRANSACTIONS);
              StorageService.get(STORAGE_KEYS.INSTALLMENTS);
              StorageService.get(STORAGE_KEYS.FINANCIAL_STATE);
              StorageService.get(STORAGE_KEYS.SCHEMA_VERSION);
            }).not.toThrow();

            // Schema version should be set correctly
            expect(StorageService.getSchemaVersion()).toBe(CURRENT_SCHEMA_VERSION);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle localStorage unavailability gracefully", () => {
      // Mock localStorage to be unavailable
      const originalLocalStorage = window.localStorage;
      
      // Create a mock that throws on access
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage unavailable'); },
          setItem: () => { throw new Error('localStorage unavailable'); },
          removeItem: () => { throw new Error('localStorage unavailable'); },
          clear: () => { throw new Error('localStorage unavailable'); },
        },
        writable: true,
      });

      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.oneof(fc.string(), fc.integer(), fc.record({ test: fc.string() })),
          (key, value) => {
            // All operations should throw StorageError with UNAVAILABLE type
            expect(() => StorageService.get(key)).toThrow(StorageError);
            expect(() => StorageService.set(key, value)).toThrow(StorageError);
            expect(() => StorageService.remove(key)).toThrow(StorageError);

            try {
              StorageService.get(key);
            } catch (error) {
              expect(error).toBeInstanceOf(StorageError);
              expect((error as StorageError).type).toBe(StorageErrorType.UNAVAILABLE);
            }
          }
        ),
        { numRuns: 50 }
      );

      // Restore original localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it("should handle quota exceeded errors gracefully", () => {
      // Mock localStorage to throw quota exceeded error only for non-test keys
      const originalLocalStorage = window.localStorage;
      
      Object.defineProperty(window, 'localStorage', {
        value: {
          ...localStorageMock,
          setItem: (key: string, _value: string) => {
            // Allow the availability test to pass
            if (key === '__storage_test__') {
              return;
            }
            // Throw quota exceeded for actual storage operations
            const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
            throw error;
          },
          removeItem: (key: string) => {
            // Allow the availability test to pass
            if (key === '__storage_test__') {
              return;
            }
            localStorageMock.removeItem(key);
          },
        },
        writable: true,
      });

      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.oneof(fc.string(), fc.integer(), fc.array(fc.string())),
          (key, value) => {
            expect(() => StorageService.set(key, value)).toThrow(StorageError);

            try {
              StorageService.set(key, value);
            } catch (error) {
              expect(error).toBeInstanceOf(StorageError);
              expect((error as StorageError).type).toBe(StorageErrorType.QUOTA_EXCEEDED);
            }
          }
        ),
        { numRuns: 50 }
      );

      // Restore original localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });
  });
});
