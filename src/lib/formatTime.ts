const WEEKDAYS = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
const MONTHS = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

const pad = (value: number): string => String(value).padStart(2, '0');

const startOfDay = (ts: number): number => {
    const date = new Date(ts);

    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

// Різниця в календарних днях (локальний час), а не в 24-годинних проміжках: переведення годинника її не ламає
export const daysBetween = (ts: number, now: number): number => Math.round((startOfDay(now) - startOfDay(ts)) / 86_400_000);

export const formatClock = (ts: number): string => {
    const date = new Date(ts);

    return `${ pad(date.getHours()) }:${ pad(date.getMinutes()) }`;
};

// Дата без року для цього року й з роком для інших; fullMonth — «October 12» замість «Oct 12»
export const formatDate = (ts: number, now: number, fullMonth = false): string => {
    const date = new Date(ts);
    const month = fullMonth ? MONTHS[ date.getMonth() ] : MONTHS[ date.getMonth() ].slice(0, 3);
    const text = `${ month } ${ date.getDate() }`;

    return date.getFullYear() === new Date(now).getFullYear() ? text : `${ text }, ${ date.getFullYear() }`;
};

export const formatListTime = (ts: number, now: number): string => {
    const days = daysBetween(ts, now);

    if (days === 0) {
        return formatClock(ts);
    }

    if (days > 0 && days <= 6) {
        return WEEKDAYS[ new Date(ts).getDay() ];
    }

    return formatDate(ts, now);
};

export const dayLabel = (ts: number, now: number): string => {
    const days = daysBetween(ts, now);

    if (days === 0) {
        return 'Today';
    }

    if (days === 1) {
        return 'Yesterday';
    }

    return formatDate(ts, now, true);
};
