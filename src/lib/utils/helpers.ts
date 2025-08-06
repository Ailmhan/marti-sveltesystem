import { format } from 'date-fns';
import { ru, kk } from 'date-fns/locale';

/**
 * Format date based on language preference
 */
export function formatDate(date: Date | string, language: 'ru' | 'kz' = 'ru'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMMM yyyy', {
    locale: language === 'ru' ? ru : kk
  });
}

/**
 * Get localized text based on language preference
 */
export function getLocalizedText(ruText: string, kzText: string, language: 'ru' | 'kz' = 'ru'): string {
  return language === 'ru' ? ruText : kzText;
}

/**
 * Reset form data to initial state
 */
export function resetFormData<T extends Record<string, any>>(initialData: T): T {
  return { ...initialData };
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Произошла неизвестная ошибка';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required fields
 */
export function validateRequired(fields: Record<string, any>): string[] {
  const errors: string[] = [];
  Object.entries(fields).forEach(([key, value]) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`Поле ${key} обязательно для заполнения`);
    }
  });
  return errors;
} 