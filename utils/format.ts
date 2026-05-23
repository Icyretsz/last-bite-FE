export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

// Get locale string based on language
export function getLocale(language?: string): string {
  return language === 'en' ? 'en-US' : 'vi-VN';
}

// Format date with locale support
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions,
  language?: string
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getLocale(language);
  return dateObj.toLocaleDateString(locale, options);
}

// Format time with locale support
export function formatTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions,
  language?: string
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getLocale(language);
  return dateObj.toLocaleTimeString(locale, options);
}

type TranslateFunction = (key: string, options?: any) => string;

export function formatCollectionTime(
  start: string, 
  end: string, 
  collectionDays?: string[],
  t?: TranslateFunction,
  language?: string
): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const startTime = formatTime(startDate, { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }, language);
  const endTime = formatTime(endDate, { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }, language);

  // If collectionDays is provided, show recurring schedule
  if (collectionDays && collectionDays.length > 0) {
    // Check if all days are selected
    if (collectionDays.length === 7) {
      const daily = t ? t('time.daily') : 'Daily';
      return `${daily} ${startTime} - ${endTime}`;
    }
    
    // Check if weekdays only
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (collectionDays.length === 5 && weekdays.every(day => collectionDays.includes(day))) {
      const weekdaysText = t ? t('time.weekdays') : 'Weekdays';
      return `${weekdaysText} ${startTime} - ${endTime}`;
    }
    
    // Check if weekends only
    const weekends = ['Saturday', 'Sunday'];
    if (collectionDays.length === 2 && weekends.every(day => collectionDays.includes(day))) {
      const weekendsText = t ? t('time.weekends') : 'Weekends';
      return `${weekendsText} ${startTime} - ${endTime}`;
    }
    
    // Show abbreviated days (Mon, Tue, etc.)
    const abbreviatedDays = collectionDays
      .map(day => t ? t(`daysOfWeekShort.${day}`) : day.substring(0, 3))
      .join(', ');
    return `${abbreviatedDays} ${startTime} - ${endTime}`;
  }

  // Fallback to original logic if no collectionDays
  const now = new Date();
  const diffDays = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `${startTime} - ${endTime}`;
  } else if (diffDays === 1) {
    const tomorrow = t ? t('time.tomorrow') : 'Tomorrow';
    return `${tomorrow} ${startTime} - ${endTime}`;
  } else if (diffDays < 7) {
    const dayName = formatDate(startDate, { weekday: 'long' }, language);
    return `${dayName} ${startTime} - ${endTime}`;
  } else {
    const dateStr = formatDate(startDate, { month: 'short', day: 'numeric' }, language);
    return `${dateStr} ${startTime} - ${endTime}`;
  }
}

export function generateReservationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
