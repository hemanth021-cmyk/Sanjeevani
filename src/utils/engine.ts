/**
 * Age-Relative Caesar Cipher Engine
 * Shift = Patient Age % 26
 * 
 * To Decrypt: We shift backwards by Age % 26.
 */

export const getShift = (age: number): number => age % 26;

export const decryptPrescription = (encryptedName: string, age: number): string => {
  const shift = getShift(age);
  let decrypted = "";

  for (let i = 0; i < encryptedName.length; i++) {
    const char = encryptedName[i];
    if (char.match(/[a-z]/i)) {
      const code = encryptedName.charCodeAt(i);
      // Uppercase letters
      if (code >= 65 && code <= 90) {
        decrypted += String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
      }
      // Lowercase letters
      else if (code >= 97 && code <= 122) {
        decrypted += String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
      }
    } else {
      decrypted += char;
    }
  }
  return decrypted;
};

export const encryptPrescription = (plainName: string, age: number): string => {
  const shift = getShift(age);
  let encrypted = "";

  for (let i = 0; i < plainName.length; i++) {
    const char = plainName[i];
    if (char.match(/[a-z]/i)) {
      const code = plainName.charCodeAt(i);
      // Uppercase letters
      if (code >= 65 && code <= 90) {
        encrypted += String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      // Lowercase letters
      else if (code >= 97 && code <= 122) {
        encrypted += String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
    } else {
      encrypted += char;
    }
  }
  return encrypted;
};

/**
 * Calculates a dynamic safety score (0-100) based on conflict severity
 */
export const calculateSafetyScore = (interactions: any[]): number => {
  let score = 100;
  for (const group of interactions) {
    if (group.severity === 'high') score -= 30;
    else if (group.severity === 'moderate') score -= 10;
  }
  return Math.max(0, score);
};
