import type { JwtPayload } from "../types/auth.payloads";
import type { AuthUser } from "../types/auth.types";

/**
 * Decodes a JWT access token payload without verifying the signature.
 * Verification is delegated to the backend on every API request.
 */
export function decodeJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const json = atob(padded);
  return JSON.parse(json) as JwtPayload;
}

/**
 * Extracts the AuthUser fields from a decoded JWT payload.
 */
export function extractUserFromToken(token: string): AuthUser {
  const payload = decodeJwt(token);
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role as AuthUser['role'],
  };
}