import { ConvexError } from 'convex/values';

export const NOT_SIGNED_IN = 'Not signed in';

export const MAX_NAME_LENGTH = 64;

export const SOUNDS = [ 'classic', 'chime', 'pop', 'ding', 'none' ] as const;

export const DEFAULT_SOUND = 'classic' satisfies (typeof SOUNDS)[ number ];

export const HEARTBEAT_MS = 25_000;

export const ONLINE_TIMEOUT_MS = 60_000;

export const MAX_MESSAGE_LENGTH = 4096;

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export const MAX_BATCH = 100;

export const DELETE_BATCH = 200;

export const AVATAR_TYPES = [ 'image/png', 'image/jpeg', 'image/webp', 'image/gif' ];

export const CHAT_NOT_FOUND = 'Chat not found';

export const MESSAGE_NOT_FOUND = 'Message not found';

export const MESSAGE_EMPTY = 'Message is empty';

export const MESSAGE_TOO_LONG = 'Message is too long';

export const NOT_YOUR_MESSAGE = 'You can only edit your own messages';

export const FORWARDED_NOT_EDITABLE = 'Forwarded messages can\'t be edited';

export const DELETE_FOR_EVERYONE_OWN_ONLY = 'You can only delete your own messages for everyone';

export const BATCH_SIZE_INVALID = 'Select from 1 to 100 messages';

export const ACCOUNT_DELETED = 'This account was deleted';

export const USER_NOT_FOUND = 'User not found';

export const CANNOT_ADD_SELF = 'You can\'t add yourself';

export const AVATAR_TYPE = 'Upload a PNG, JPEG, WebP or GIF image';

export const AVATAR_TOO_BIG = 'Image must be 5 MB or smaller';

export const DELETED_ACCOUNT = 'Deleted account';

export const DELETED_MESSAGE = 'Deleted message';

export const normalizeBody = (value: string): string => {
    const body = value.trim();

    if (body === '') {
        throw new ConvexError(MESSAGE_EMPTY);
    }

    if (body.length > MAX_MESSAGE_LENGTH) {
        throw new ConvexError(MESSAGE_TOO_LONG);
    }

    return body;
};

export const pairKey = (a: string, b: string): string => [ a, b ].sort().join('|');
