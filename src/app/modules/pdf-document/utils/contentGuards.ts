/**
 * Content Guards - Runtime protection for generated content
 * 
 * Prevents accidental modification/deletion of generated content
 * Generated content has IDs starting with "gen_"
 * User content has IDs starting with "user_"
 */

/**
 * Check if an ID belongs to generated content
 */
export function isGeneratedId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return id.startsWith('gen_');
}

/**
 * Return true when a section has no user-visible content.
 * Handles empty strings and placeholder HTML emitted by older extraction runs.
 */
export function isEmptySectionContent(content: unknown): boolean {
  if (content == null) {
    return true;
  }
  if (typeof content !== "string") {
    return false;
  }

  const normalized = content
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(p|div|span|strong|em|b|i|u|s|ul|ol|li)[^>]*>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/\u00a0/g, " ")
    .trim();

  return normalized.length === 0;
}

/**
 * Check if an ID belongs to user-created content
 */
export function isUserId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return id.startsWith('user_');
}

/**
 * Guard against modifying generated content
 * Throws an error if the ID is a generated ID
 */
export function guardGeneratedContent(id: string, operation: string): void {
  if (isGeneratedId(id)) {
    throw new Error(`Cannot ${operation} generated content: ${id}. Generated content is read-only.`);
  }
}

/**
 * Guard against modifying user content (for operations that should only work on generated)
 * Throws an error if the ID is a user ID
 */
export function guardUserContent(id: string, operation: string): void {
  if (isUserId(id)) {
    throw new Error(`Cannot ${operation} user content: ${id}. This operation is only for generated content.`);
  }
}

/**
 * Validate that an ID has a proper prefix
 */
export function validateIdPrefix(id: string): boolean {
  return isGeneratedId(id) || isUserId(id);
}

/**
 * Extract the type from a user ID
 * Returns "airplane" for user_airplane_* or "hotel" for user_hotel_*
 */
export function getUserElementType(id: string): "airplane" | "hotel" | null {
  if (!isUserId(id)) {
    return null;
  }
  if (id.startsWith('user_airplane_')) {
    return 'airplane';
  }
  if (id.startsWith('user_hotel_')) {
    return 'hotel';
  }
  return null;
}
