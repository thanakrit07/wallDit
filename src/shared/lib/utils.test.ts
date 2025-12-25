import { describe, it, expect } from 'vitest';
import { generateId, formatCurrency, formatDate, isValidDate, addMonths, daysBetween } from './utils';

describe('Utils', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(123.45)).toBe('$123.45');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toBe('Jan 15, 2024');
    });
  });

  describe('isValidDate', () => {
    it('should validate dates correctly', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('addMonths', () => {
    it('should add months correctly', () => {
      expect(addMonths('2024-01-15', 1)).toBe('2024-02-15');
      expect(addMonths('2024-01-15', 12)).toBe('2025-01-15');
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between dates', () => {
      expect(daysBetween('2024-01-01', '2024-01-02')).toBe(1);
      expect(daysBetween('2024-01-01', '2024-01-08')).toBe(7);
    });
  });
});