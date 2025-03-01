// Generate a secure invite code using a combination of timestamp, random string, and challenge type
export function generateInviteCode(challengeType: 'no-loss' | 'hardcore'): string {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const randomStr = Math.random().toString(36).substring(2, 8); // 6 random chars
  const prefix = challengeType === 'no-loss' ? 'NL' : 'HC';
  
  // Combine parts: prefix + timestamp + random
  return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
}

// Validate an invite code
export function validateInviteCode(code: string): boolean {
  // Check format: XX-TIMESTAMP-RANDOM
  const parts = code.split('-');
  if (parts.length !== 3) return false;
  
  // Check prefix
  if (!['NL', 'HC'].includes(parts[0])) return false;
  
  // Check timestamp (should be base36)
  if (!/^[0-9a-z]+$/i.test(parts[1])) return false;
  
  // Check random string (should be 6 chars)
  if (parts[2].length !== 6) return false;
  
  return true;
}
