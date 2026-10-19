import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const play = vi.fn(() => Promise.resolve());
const audioCtor = vi.fn();
const resume = vi.fn(() => Promise.resolve());
const contextCtor = vi.fn();
const oscillator = () => ({ type: '', frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() });
const gain = () => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn()
});

beforeEach(() => {
    vi.resetModules();
    play.mockClear();
    audioCtor.mockClear();
    contextCtor.mockClear();
    vi.stubGlobal('Audio', class {
        constructor(src: string) {
            audioCtor(src);
        }

        play = play;
    });
    vi.stubGlobal('AudioContext', class {
        state = 'suspended';
        currentTime = 0;
        destination = {};
        resume = resume;
        createOscillator = vi.fn(oscillator);
        createGain = vi.fn(gain);

        constructor() {
            contextCtor();
        }
    });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

test('playSound none plays nothing and classic reuses one audio element', async () => {
    const { playSound } = await import('./sounds');

    await playSound('none');

    expect(audioCtor).not.toHaveBeenCalled();
    expect(contextCtor).not.toHaveBeenCalled();

    await playSound('classic');
    await playSound('classic');

    expect(audioCtor).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledTimes(2);
});

test('synthesized sounds share one AudioContext and resume it', async () => {
    const { playSound } = await import('./sounds');

    await playSound('chime');
    await playSound('pop');

    expect(contextCtor).toHaveBeenCalledTimes(1);
    expect(resume).toHaveBeenCalled();
});

test('a rejected autoplay is swallowed', async () => {
    play.mockRejectedValueOnce(new Error('NotAllowedError'));
    const { playSound } = await import('./sounds');

    await expect(playSound('classic')).resolves.toBeUndefined();
});
