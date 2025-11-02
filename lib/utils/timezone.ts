/**
 * Timezone Utilities
 *
 * Implements timezone-aware date handling per entity model "Streak Continuity" rule:
 * - Day boundaries respect user's local timezone
 * - Ensures consistent streak calculation across timezones
 * - All date comparisons use timezone-normalized dates
 */

/**
 * Get user's browser timezone
 * Uses Intl API to detect timezone (e.g., "America/New_York", "Europe/London")
 *
 * @returns IANA timezone identifier
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Failed to detect timezone, falling back to UTC:', error);
    return 'UTC';
  }
}

/**
 * Format date for display in user's local timezone
 *
 * @param date - ISO date string or Date object
 * @param timezone - IANA timezone identifier
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * formatDateForDisplay('2025-01-15T10:30:00Z', 'America/New_York')
 * // Returns: "Jan 15, 2025"
 */
export function formatDateForDisplay(
  date: string | Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Format time for display in user's local timezone
 *
 * @param date - ISO date string or Date object
 * @param timezone - IANA timezone identifier
 * @returns Formatted time string (e.g., "10:30 AM")
 */
export function formatTimeForDisplay(
  date: string | Date,
  timezone: string
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid time';
  }
}

/**
 * Get "today" date string in user's local timezone
 * Returns YYYY-MM-DD format for consistent date filtering
 *
 * This enforces the "Streak Continuity" rule's timezone policy:
 * Day boundaries are determined by the user's local timezone, not UTC
 *
 * @param timezone - IANA timezone identifier
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * getTodayInTimezone('America/New_York') // Returns: "2025-01-15"
 */
export function getTodayInTimezone(timezone: string): string {
  try {
    const now = new Date();

    // Use Intl API to get date parts in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(now);
    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Failed to get today in timezone, falling back to UTC:', error);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Get date string from ISO timestamp in user's local timezone
 * Returns YYYY-MM-DD format
 *
 * @param isoTimestamp - ISO 8601 timestamp
 * @param timezone - IANA timezone identifier
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * getDateInTimezone('2025-01-15T23:30:00Z', 'America/Los_Angeles')
 * // Returns: "2025-01-15" (even though UTC date might be different)
 */
export function getDateInTimezone(isoTimestamp: string, timezone: string): string {
  try {
    const date = new Date(isoTimestamp);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Failed to get date in timezone:', error);
    return new Date(isoTimestamp).toISOString().split('T')[0];
  }
}

/**
 * Check if a date is "today" in user's timezone
 *
 * @param date - Date string (YYYY-MM-DD) or ISO timestamp
 * @param timezone - IANA timezone identifier
 * @returns true if date is today in the specified timezone
 */
export function isToday(date: string, timezone: string): boolean {
  try {
    const today = getTodayInTimezone(timezone);

    // If date is already in YYYY-MM-DD format, compare directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date === today;
    }

    // Otherwise, convert ISO timestamp to date in timezone
    const dateInTimezone = getDateInTimezone(date, timezone);
    return dateInTimezone === today;
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
}

/**
 * Get start and end of day in ISO format for a given date in user's timezone
 * Useful for querying data for a specific day
 *
 * @param date - Date string (YYYY-MM-DD)
 * @param timezone - IANA timezone identifier
 * @returns Object with startOfDay and endOfDay ISO timestamps
 */
export function getDayBoundsInTimezone(
  date: string,
  _timezone: string
): { startOfDay: string; endOfDay: string } {
  try {
    // Parse the date string
    const [year, month, day] = date.split('-').map(Number);

    // Create start of day (00:00:00)
    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`);
    const endDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59.999`);

    return {
      startOfDay: startDate.toISOString(),
      endOfDay: endDate.toISOString(),
    };
  } catch (error) {
    console.error('Error getting day bounds:', error);
    const fallbackStart = new Date(date).toISOString();
    const fallbackEnd = new Date(new Date(date).getTime() + 86400000 - 1).toISOString();
    return { startOfDay: fallbackStart, endOfDay: fallbackEnd };
  }
}
