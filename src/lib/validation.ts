/**
 * Input validation utilities for the Kraamweek application
 * Provides comprehensive validation for all user inputs to prevent injection attacks
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: unknown;
}

// Email validation regex - more restrictive to prevent XSS
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Name validation - only letters, spaces, hyphens, apostrophes
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;

// Password validation - minimum 8 chars, at least one letter and number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '&': return '&amp;';
        default: return char;
      }
    });
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('E-mailadres is verplicht');
    return { isValid: false, errors };
  }
  
  const sanitized = sanitizeString(email.toLowerCase());
  
  if (sanitized.length > 254) {
    errors.push('E-mailadres is te lang');
  }
  
  if (!EMAIL_REGEX.test(sanitized)) {
    errors.push('Ongeldig e-mailadres formaat');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Wachtwoord is verplicht');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Wachtwoord moet minimaal 8 karakters bevatten');
  }
  
  if (password.length > 128) {
    errors.push('Wachtwoord is te lang (maximaal 128 karakters)');
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    errors.push('Wachtwoord moet minimaal één letter en één cijfer bevatten');
  }
  
  // Check for common passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Dit wachtwoord is te zwak');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: password // Don't sanitize passwords, just validate
  };
}

/**
 * Validate name input
 */
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name || typeof name !== 'string') {
    errors.push('Naam is verplicht');
    return { isValid: false, errors };
  }
  
  const sanitized = sanitizeString(name);
  
  if (sanitized.length < 2) {
    errors.push('Naam moet minimaal 2 karakters bevatten');
  }
  
  if (sanitized.length > 100) {
    errors.push('Naam is te lang (maximaal 100 karakters)');
  }
  
  if (!NAME_REGEX.test(sanitized)) {
    errors.push('Naam mag alleen letters, spaties, koppeltekens en apostroffen bevatten');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

/**
 * Validate role
 */
export function validateRole(role: string): ValidationResult {
  const errors: string[] = [];
  const validRoles = ['ouders', 'kraamhulp'];
  
  if (!role || typeof role !== 'string') {
    errors.push('Rol is verplicht');
    return { isValid: false, errors };
  }
  
  const sanitized = sanitizeString(role.toLowerCase());
  
  if (!validRoles.includes(sanitized)) {
    errors.push('Ongeldige rol');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

/**
 * Validate numeric input
 */
export function validateNumber(value: unknown, min?: number, max?: number, fieldName = 'Waarde'): ValidationResult {
  const errors: string[] = [];
  
  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is verplicht`);
    return { isValid: false, errors };
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
    errors.push(`${fieldName} moet een geldig getal zijn`);
    return { isValid: false, errors };
  }
  
  if (min !== undefined && num < min) {
    errors.push(`${fieldName} moet minimaal ${min} zijn`);
  }
  
  if (max !== undefined && num > max) {
    errors.push(`${fieldName} mag maximaal ${max} zijn`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: num
  };
}

/**
 * Validate date string
 */
export function validateDate(dateString: string, fieldName = 'Datum'): ValidationResult {
  const errors: string[] = [];
  
  if (!dateString || typeof dateString !== 'string') {
    errors.push(`${fieldName} is verplicht`);
    return { isValid: false, errors };
  }
  
  const sanitized = sanitizeString(dateString);
  const date = new Date(sanitized);
  
  if (isNaN(date.getTime())) {
    errors.push(`${fieldName} is geen geldige datum`);
    return { isValid: false, errors };
  }
  
  // Check if date is not too far in the future (1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (date > oneYearFromNow) {
    errors.push(`${fieldName} mag niet meer dan een jaar in de toekomst liggen`);
  }
  
  // Check if date is not too far in the past (2 years)
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  if (date < twoYearsAgo) {
    errors.push(`${fieldName} mag niet meer dan twee jaar in het verleden liggen`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: date.toISOString()
  };
}

/**
 * Validate notes/text content
 */
export function validateNotes(notes: string): ValidationResult {
  const errors: string[] = [];
  
  if (notes && typeof notes !== 'string') {
    errors.push('Notities moeten tekst zijn');
    return { isValid: false, errors };
  }
  
  if (!notes) {
    return { isValid: true, errors: [], sanitizedValue: '' };
  }
  
  const sanitized = sanitizeString(notes);
  
  if (sanitized.length > 1000) {
    errors.push('Notities mogen maximaal 1000 karakters bevatten');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

/**
 * Validate baby record type
 */
export function validateBabyRecordType(type: string): ValidationResult {
  const errors: string[] = [];
  const validTypes = ['temperature', 'feeding', 'sleep', 'diaper', 'weight', 'jaundice', 'notes'];
  
  if (!type || typeof type !== 'string') {
    errors.push('Record type is verplicht');
    return { isValid: false, errors };
  }
  
  const sanitized = sanitizeString(type.toLowerCase());
  
  if (!validTypes.includes(sanitized)) {
    errors.push('Ongeldig record type');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

/**
 * Validate mother record type
 */
export function validateMotherRecordType(type: string): ValidationResult {
  const errors: string[] = [];
  const validTypes = ['temperature', 'blood_pressure', 'pain', 'mood', 'bleeding', 'notes'];
  
  if (!type || typeof type !== 'string') {
    errors.push('Record type is verplicht');
    return { isValid: false, errors };
  }
  
  const sanitized = sanitizeString(type.toLowerCase());
  
  if (!validTypes.includes(sanitized)) {
    errors.push('Ongeldig record type');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  };
}

/**
 * Comprehensive validation for baby records
 */
export function validateBabyRecord(record: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const sanitizedRecord: Record<string, unknown> = {};
  
  // Validate timestamp
  const timestampValidation = validateDate(record.timestamp as string, 'Tijdstip');
  if (!timestampValidation.isValid) {
    errors.push(...timestampValidation.errors);
  } else {
    sanitizedRecord.timestamp = timestampValidation.sanitizedValue;
  }
  
  // Validate type
  const typeValidation = validateBabyRecordType(record.type as string);
  if (!typeValidation.isValid) {
    errors.push(...typeValidation.errors);
  } else {
    sanitizedRecord.type = typeValidation.sanitizedValue;
  }
  
  // Type-specific validation
  switch (sanitizedRecord.type) {
    case 'temperature':
      const tempValidation = validateNumber(record.value, 30, 45, 'Temperatuur');
      if (!tempValidation.isValid) {
        errors.push(...tempValidation.errors);
      } else {
        sanitizedRecord.value = tempValidation.sanitizedValue;
      }
      break;
      
    case 'weight':
      const weightValidation = validateNumber(record.weight, 0.5, 20, 'Gewicht');
      if (!weightValidation.isValid) {
        errors.push(...weightValidation.errors);
      } else {
        sanitizedRecord.weight = weightValidation.sanitizedValue;
      }
      break;
      
    case 'feeding':
      if (record.duration) {
        const durationValidation = validateNumber(record.duration, 1, 120, 'Duur');
        if (!durationValidation.isValid) {
          errors.push(...durationValidation.errors);
        } else {
          sanitizedRecord.duration = durationValidation.sanitizedValue;
        }
      }
      if (record.amount) {
        const amountValidation = validateNumber(record.amount, 1, 500, 'Hoeveelheid');
        if (!amountValidation.isValid) {
          errors.push(...amountValidation.errors);
        } else {
          sanitizedRecord.amount = amountValidation.sanitizedValue;
        }
      }
      break;
  }
  
  // Validate notes if present
  if (record.notes) {
    const notesValidation = validateNotes(record.notes as string);
    if (!notesValidation.isValid) {
      errors.push(...notesValidation.errors);
    } else {
      sanitizedRecord.notes = notesValidation.sanitizedValue;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedRecord
  };
}

/**
 * Comprehensive validation for registration data
 */
export function validateRegistrationData(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, unknown> = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email as string);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    sanitizedData.email = emailValidation.sanitizedValue;
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password as string);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  } else {
    sanitizedData.password = passwordValidation.sanitizedValue;
  }
  
  // Validate name
  const nameValidation = validateName(data.naam as string);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  } else {
    sanitizedData.naam = nameValidation.sanitizedValue;
  }
  
  // Validate role
  const roleValidation = validateRole(data.rol as string);
  if (!roleValidation.isValid) {
    errors.push(...roleValidation.errors);
  } else {
    sanitizedData.rol = roleValidation.sanitizedValue;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedData
  };
}

/**
 * Comprehensive validation for login data
 */
export function validateLoginData(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, unknown> = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email as string);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    sanitizedData.email = emailValidation.sanitizedValue;
  }
  
  // Basic password presence check (don't validate strength for login)
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Wachtwoord is verplicht');
  } else {
    sanitizedData.password = data.password;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedData
  };
}