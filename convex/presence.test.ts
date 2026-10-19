import { afterEach, describe, expect, test, vi } from 'vitest';

import { api } from './_generated/api';
import { NOT_SIGNED_IN, ONLINE_TIMEOUT_MS } from './chatRules';
import { presenceOf } from './presence';
import { asUser, setup } from './test.setup';

afterEach(() => {
    vi.useRealTimers();
});

const start = async () => {
    vi.useFakeTimers();

    const t = setup();
    const alice = await asUser(t, 'Alice');
    const lookup = async () => t.run(async ctx => presenceOf(ctx, alice.userId));

    return { t, alice, lookup };
};

describe('presence', () => {
    test('heartbeat marks the user online', async () => {
        const { alice, lookup } = await start();

        await alice.client.mutation(api.presence.heartbeat, {});

        expect(await lookup()).toEqual({ online: true, lastSeenAt: Date.now() });
    });

    test('without heartbeats the user goes offline after the timeout', async () => {
        const { t, alice, lookup } = await start();

        await alice.client.mutation(api.presence.heartbeat, {});

        const seenAt = Date.now();

        vi.advanceTimersByTime(ONLINE_TIMEOUT_MS);
        await t.finishInProgressScheduledFunctions();

        expect(await lookup()).toEqual({ online: false, lastSeenAt: seenAt });
    });

    test('a newer heartbeat cancels the pending expiry', async () => {
        const { t, alice, lookup } = await start();

        await alice.client.mutation(api.presence.heartbeat, {});
        vi.advanceTimersByTime(40_000);
        await alice.client.mutation(api.presence.heartbeat, {});
        vi.advanceTimersByTime(40_000);
        await t.finishInProgressScheduledFunctions();

        expect((await lookup()).online).toBe(true);
    });

    test('disconnect marks offline at once', async () => {
        const { t, alice, lookup } = await start();

        await alice.client.mutation(api.presence.heartbeat, {});
        vi.advanceTimersByTime(5000);
        await alice.client.mutation(api.presence.disconnect, {});

        const leftAt = Date.now();

        expect(await lookup()).toEqual({ online: false, lastSeenAt: leftAt });

        await t.finishAllScheduledFunctions(vi.runAllTimers);

        expect(await lookup()).toEqual({ online: false, lastSeenAt: leftAt });
    });

    test('a user who never connected has no last seen', async () => {
        const { lookup } = await start();

        expect(await lookup()).toEqual({ online: false, lastSeenAt: null });
    });

    test('heartbeat requires sign-in', async () => {
        const { t } = await start();

        await expect(t.mutation(api.presence.heartbeat, {})).rejects.toThrow(NOT_SIGNED_IN);
    });
});
