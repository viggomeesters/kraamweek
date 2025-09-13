import { 
  formatTime24, 
  formatDateDDMMYYYY, 
  formatDateTime24, 
  formatDateLong 
} from '@/lib/dateUtils';

describe('dateUtils', () => {
  // Test with a fixed date for consistent results
  const testDate = new Date('2024-12-15T14:30:45.123Z');
  const testISOString = '2024-12-15T14:30:45.123Z';

  describe('formatTime24', () => {
    it('should format time in 24-hour format from Date object', () => {
      const result = formatTime24(testDate);
      expect(result).toMatch(/^\d{2}:\d{2}$/); // Should be HH:MM format
      expect(result).not.toMatch(/AM|PM|am|pm/);
    });

    it('should format time in 24-hour format from ISO string', () => {
      const result = formatTime24(testISOString);
      expect(result).toMatch(/^\d{2}:\d{2}$/); // Should be HH:MM format
      expect(result).not.toMatch(/AM|PM|am|pm/);
    });

    it('should handle midnight correctly', () => {
      const midnight = new Date('2024-12-15T00:00:00.000Z');
      const result = formatTime24(midnight);
      expect(result).toMatch(/^\d{2}:\d{2}$/); // Should be valid time format
      expect(result).not.toMatch(/AM|PM|am|pm/);
    });

    it('should handle noon correctly', () => {
      const noon = new Date('2024-12-15T12:00:00.000Z');
      const result = formatTime24(noon);
      expect(result).toMatch(/^\d{2}:\d{2}$/); // Should be valid time format
      expect(result).not.toMatch(/AM|PM|am|pm/);
    });

    it('should never include AM/PM', () => {
      const result = formatTime24(testDate);
      expect(result).not.toMatch(/AM|PM|am|pm/);
    });
  });

  describe('formatDateDDMMYYYY', () => {
    it('should format date in DD-MM-YYYY format from Date object', () => {
      const result = formatDateDDMMYYYY(testDate);
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/); // Should be DD-MM-YYYY format
    });

    it('should format date in DD-MM-YYYY format from ISO string', () => {
      const result = formatDateDDMMYYYY(testISOString);
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/); // Should be DD-MM-YYYY format
    });

    it('should handle single digit days and months correctly', () => {
      const singleDigitDate = new Date('2024-01-05T12:00:00.000Z');
      const result = formatDateDDMMYYYY(singleDigitDate);
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/); // Should be DD-MM-YYYY format with leading zeros
    });
  });

  describe('formatDateTime24', () => {
    it('should format full datetime in Dutch format from Date object', () => {
      const result = formatDateTime24(testDate);
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}[\s,]+\d{2}:\d{2}$/); // Should be DD-MM-YYYY HH:MM format
      expect(result).not.toMatch(/AM|PM|am|pm/);
    });

    it('should format full datetime in Dutch format from ISO string', () => {
      const result = formatDateTime24(testISOString);
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}[\s,]+\d{2}:\d{2}$/); // Should be DD-MM-YYYY HH:MM format
      expect(result).not.toMatch(/AM|PM|am|pm/);
    });

    it('should never include AM/PM in full datetime', () => {
      const result = formatDateTime24(testDate);
      expect(result).not.toMatch(/AM|PM|am|pm/);
    });

    it('should maintain 24-hour format across day boundary', () => {
      const lateEvening = new Date('2024-12-15T23:45:00.000Z');
      const result = formatDateTime24(lateEvening);
      expect(result).toMatch(/^\d{2}-\d{2}-\d{4}[\s,]+\d{2}:\d{2}$/); // Should be valid datetime format
      expect(result).not.toMatch(/AM|PM|am|pm/);
    });
  });

  describe('formatDateLong', () => {
    it('should format date with Dutch month names from Date object', () => {
      const result = formatDateLong(testDate);
      expect(result).toMatch(/\d{1,2} \w+ \d{4}/); // Should contain day, month name, year
    });

    it('should format date with Dutch month names from ISO string', () => {
      const result = formatDateLong(testISOString);
      expect(result).toMatch(/\d{1,2} \w+ \d{4}/); // Should contain day, month name, year
    });

    it('should handle different months correctly', () => {
      const januaryDate = new Date('2024-01-15T12:00:00.000Z');
      const result = formatDateLong(januaryDate);
      expect(result).toMatch(/\d{1,2} \w+ \d{4}/); // Should contain day, month name, year
    });
  });

  describe('Type safety and error handling', () => {
    it('should handle invalid date strings gracefully', () => {
      const invalidDate = new Date('invalid-date');
      expect(() => formatTime24(invalidDate)).not.toThrow();
      expect(() => formatDateDDMMYYYY(invalidDate)).not.toThrow();
      expect(() => formatDateTime24(invalidDate)).not.toThrow();
      expect(() => formatDateLong(invalidDate)).not.toThrow();
    });

    it('should maintain consistency between string and Date inputs', () => {
      const dateObj = new Date(testISOString);
      
      expect(formatTime24(testISOString)).toBe(formatTime24(dateObj));
      expect(formatDateDDMMYYYY(testISOString)).toBe(formatDateDDMMYYYY(dateObj));
      expect(formatDateTime24(testISOString)).toBe(formatDateTime24(dateObj));
      expect(formatDateLong(testISOString)).toBe(formatDateLong(dateObj));
    });
  });

  describe('Locale consistency', () => {
    it('should always use Dutch locale (nl-NL)', () => {
      // Test various dates to ensure consistent Dutch formatting
      const dates = [
        new Date('2024-01-01T12:00:00.000Z'), // January
        new Date('2024-06-15T12:00:00.000Z'), // June
        new Date('2024-12-31T12:00:00.000Z'), // December
      ];

      dates.forEach(date => {
        const longFormat = formatDateLong(date);
        // Should contain Dutch month names
        expect(longFormat).toMatch(/januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december/);
      });
    });
  });

  describe('24-hour format validation', () => {
    it('should always return valid 24-hour time format', () => {
      const testDates = [
        new Date('2024-01-01T00:00:00.000Z'), // Midnight
        new Date('2024-01-01T06:30:00.000Z'), // Morning
        new Date('2024-01-01T12:00:00.000Z'), // Noon
        new Date('2024-01-01T18:45:00.000Z'), // Evening
        new Date('2024-01-01T23:59:00.000Z'), // End of day
      ];

      testDates.forEach(date => {
        const timeResult = formatTime24(date);
        const datetimeResult = formatDateTime24(date);
        
        // Time should be in HH:MM format
        expect(timeResult).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
        
        // Datetime should contain valid time part
        expect(datetimeResult).toMatch(/[0-2][0-9]:[0-5][0-9]/);
        
        // Never contain AM/PM
        expect(timeResult).not.toMatch(/AM|PM|am|pm/);
        expect(datetimeResult).not.toMatch(/AM|PM|am|pm/);
      });
    });
  });
});