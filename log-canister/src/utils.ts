import { Principal } from 'azle';
import { v4 as uuidv4 } from 'uuid';
import { ErrorType } from './types';

/**
 * Generate a new UUID-based Principal ID
 */
export function generateId(): Principal {
  const uuid = uuidv4().replace(/-/g, '');
  return Principal.fromText(uuid);
}

/**
 * Helper function to handle and format errors consistently.
 * @param error - The caught error.
 * @returns The formatted error object.
 */
export function handleError(error: any): ErrorType {
  // Check if the error is an object and has a recognized key
  if (error && typeof error === 'object') {
    const keys = Object.keys(error); // Get keys from the error object

    // Check if the error contains a known variant key
    if (keys.includes('Unauthorized')) {
      return { Unauthorized: error.Unauthorized };
    } else if (keys.includes('Conflict')) {
      return { Conflict: error.Conflict };
    } else if (keys.includes('NotFound')) {
      return { NotFound: error.NotFound };
    } else if (keys.includes('ValidationError')) {
      return { ValidationError: error.ValidationError };
    } else if (keys.includes('InternalError')) {
      return { InternalError: error.InternalError };
    }
  }

  // Default error if structure doesn't match or no known variants are found
  return {
    InternalError:
      'An unknown error occurred. ' + JSON.stringify(error, null, 4),
  };
}

/**
 * Validate hash format (basic validation)
 */
export function validateHash(hash: string): void {
  if (!hash || typeof hash !== 'string') {
    throw { ValidationError: 'Hash is required and must be a string' };
  }

  // Check if it looks like a hex string (keccak256 produces 64 character hex)
  if (!/^[a-fA-F0-9]{64}$/.test(hash)) {
    throw { ValidationError: 'Hash must be a 64-character hexadecimal string' };
  }
}
