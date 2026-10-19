import { v } from 'convex/values';

import { SOUNDS } from './chatRules';

export type Sound = (typeof SOUNDS)[ number ];

export const soundValidator = v.union(
    ...SOUNDS.map(sound => v.literal(sound)) as [ ReturnType<typeof v.literal<Sound>>, ReturnType<typeof v.literal<Sound>>, ...ReturnType<typeof v.literal<Sound>>[] ]
);
