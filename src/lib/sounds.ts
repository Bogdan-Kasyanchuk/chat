import classicUrl from '@/assets/sounds/classic.mp3';
import type { Sound } from '@convex/validators';

export const SOUND_OPTIONS: Array<{ value: Sound, label: string }> = [
    { value: 'classic', label: 'Classic' },
    { value: 'chime', label: 'Chime' },
    { value: 'pop', label: 'Pop' },
    { value: 'ding', label: 'Ding' },
    { value: 'none', label: 'None' }
];

type Tone = { freq: number, start: number, duration: number, type: OscillatorType };

export const SYNTH: Record<'chime' | 'pop' | 'ding', Tone[]> = {
    chime: [
        { freq: 880, start: 0, duration: 0.12, type: 'sine' },
        { freq: 1320, start: 0.1, duration: 0.2, type: 'sine' }
    ],
    pop: [ { freq: 620, start: 0, duration: 0.08, type: 'triangle' } ],
    ding: [ { freq: 1046, start: 0, duration: 0.4, type: 'sine' } ]
};

const VOLUME = 0.2;

let audio: HTMLAudioElement | undefined;
let context: AudioContext | undefined;

const playTone = (ctx: AudioContext, { freq, start, duration, type }: Tone) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const from = ctx.currentTime + start;
    const to = from + duration;

    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(VOLUME, from);
    gain.gain.exponentialRampToValueAtTime(0.0001, to);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(from);
    oscillator.stop(to);
};

export const playSound = async (sound: Sound): Promise<void> => {
    try {
        if (sound === 'none') {
            return;
        }

        if (sound === 'classic') {
            audio ??= new Audio(classicUrl);
            audio.currentTime = 0;
            await audio.play();

            return;
        }

        context ??= new AudioContext();

        if (context.state === 'suspended') {
            await context.resume();
        }

        SYNTH[ sound ].forEach(tone => {
            playTone(context!, tone);
        });
    } catch {
        // Браузер може заборонити автоплей до першої взаємодії з сторінкою
    }
};
