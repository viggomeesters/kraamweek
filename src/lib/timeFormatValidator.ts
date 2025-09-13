// Utility to validate that 24-hour time format is used throughout the app
// Helps detect any accidental AM/PM usage

/**
 * Check if text contains AM/PM indicators
 * @param text Text to check for AM/PM patterns
 * @returns true if AM/PM found, false otherwise
 */
export const containsAmPm = (text: string): boolean => {
  const amPmPattern = /\b(AM|PM|am|pm|a\.m\.|p\.m\.|A\.M\.|P\.M\.)\b/gi;
  return amPmPattern.test(text);
};

/**
 * Get all AM/PM matches in text for debugging
 * @param text Text to search
 * @returns Array of matched AM/PM patterns
 */
export const getAmPmMatches = (text: string): string[] => {
  const amPmPattern = /\b(AM|PM|am|pm|a\.m\.|p\.m\.|A\.M\.|P\.M\.)\b/gi;
  return text.match(amPmPattern) || [];
};

/**
 * Validate that a time string is in 24-hour format (HH:MM)
 * @param timeString Time string to validate
 * @returns true if valid 24-hour format, false otherwise
 */
export const isValid24HourFormat = (timeString: string): boolean => {
  const time24Pattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return time24Pattern.test(timeString);
};

/**
 * Clean any potential AM/PM from time string and ensure 24-hour format
 * @param timeString Potentially dirty time string
 * @returns Cleaned 24-hour format string or original if already clean
 */
export const ensure24HourFormat = (timeString: string): string => {
  // Remove any AM/PM indicators
  const cleaned = timeString.replace(/\b(AM|PM|am|pm|a\.m\.|p\.m\.|A\.M\.|P\.M\.)\s*/gi, '').trim();
  
  // If it's already in valid 24-hour format, return as is
  if (isValid24HourFormat(cleaned)) {
    return cleaned;
  }
  
  // If it doesn't match expected pattern, return the original (let validation catch it)
  return timeString;
};