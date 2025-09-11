// Utility functions for consistent date and time formatting
// Ensures 24-hour time format (HH:MM) and DD-MM-YYYY date format throughout the app

/**
 * Format time in 24-hour format (HH:MM)
 * @param timestamp ISO timestamp string or Date object
 * @returns Formatted time string (HH:MM)
 */
export const formatTime24 = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Format date in DD-MM-YYYY format
 * @param timestamp ISO timestamp string or Date object
 * @returns Formatted date string (DD-MM-YYYY)
 */
export const formatDateDDMMYYYY = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format full date and time in Dutch format with 24-hour time
 * @param timestamp ISO timestamp string or Date object
 * @returns Formatted datetime string (DD-MM-YYYY HH:MM)
 */
export const formatDateTime24 = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Format date for display with month name (e.g., "15 januari 2024")
 * @param timestamp ISO timestamp string or Date object
 * @returns Formatted date string with month name
 */
export const formatDateLong = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date for charts (DD/MM format to save space)
 * @param dateStr Date string in ISO format
 * @returns Formatted date string (DD/MM)
 */
export const formatDateChart = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};