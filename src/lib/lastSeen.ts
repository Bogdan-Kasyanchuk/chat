import { daysBetween, formatClock, formatDate } from './formatTime';

const MINUTE_MS = 60_000;

type Presence = { online: boolean, lastSeenAt: number | null };

const lastSeenText = ({ online, lastSeenAt }: Presence, now: number): string => {
    if (online) {
        return 'online';
    }

    if (lastSeenAt === null) {
        return 'last seen a long time ago';
    }

    const minutes = Math.floor((now - lastSeenAt) / MINUTE_MS);

    if (minutes < 1) {
        return 'last seen just now';
    }

    if (minutes < 60) {
        return `last seen ${ minutes } ${ minutes === 1 ? 'minute' : 'minutes' } ago`;
    }

    const days = daysBetween(lastSeenAt, now);

    if (days === 0) {
        return `last seen today at ${ formatClock(lastSeenAt) }`;
    }

    if (days === 1) {
        return `last seen yesterday at ${ formatClock(lastSeenAt) }`;
    }

    return `last seen ${ formatDate(lastSeenAt, now) }`;
};

export default lastSeenText;
