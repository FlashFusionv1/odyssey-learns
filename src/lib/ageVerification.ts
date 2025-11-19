/**
 * Age Verification Utilities for COPPA Compliance
 * Verifies parents are 18+ during signup
 */

export interface AgeVerificationResult {
  isValid: boolean;
  age: number;
  error?: string;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Verify parent meets minimum age requirement (18+)
 */
export function verifyParentAge(dateOfBirth: Date): AgeVerificationResult {
  const age = calculateAge(dateOfBirth);
  
  if (age < 18) {
    return {
      isValid: false,
      age,
      error: 'You must be at least 18 years old to create a parent account. This is required by COPPA regulations to protect children\'s privacy.'
    };
  }
  
  if (age > 120) {
    return {
      isValid: false,
      age,
      error: 'Please enter a valid date of birth.'
    };
  }
  
  return { isValid: true, age };
}

/**
 * Extract birth year from date (for privacy-safe storage)
 */
export function extractBirthYear(dateOfBirth: Date): number {
  return dateOfBirth.getFullYear();
}

/**
 * Validate date of birth format
 */
export function validateDateOfBirth(dobString: string): { isValid: boolean; date?: Date; error?: string } {
  try {
    const date = new Date(dobString);
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }
    
    // Date can't be in the future
    if (date > new Date()) {
      return { isValid: false, error: 'Date of birth cannot be in the future' };
    }
    
    // Date can't be more than 120 years ago
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (date < minDate) {
      return { isValid: false, error: 'Please enter a valid date of birth' };
    }
    
    return { isValid: true, date };
  } catch (error) {
    return { isValid: false, error: 'Invalid date format' };
  }
}
