export const NOT_SIGNED_IN = 'Not signed in';

export const MAX_NAME_LENGTH = 64;

export const SOUNDS = [ 'classic', 'chime', 'pop', 'ding', 'none' ] as const;

export const DEFAULT_SOUND = 'classic' satisfies (typeof SOUNDS)[ number ];
