// Тло ініціалів без фото: сім кольорів з аркуша Components канвасу, однакові в обох темах (текст білий)
export const AVATAR_COLORS = [ '#2F74B5', '#B84F84', '#9C6A0E', '#3E8A4A', '#7553C2', '#C4573F', '#1F7F7C' ] as const;

// Видалений акаунт
export const AVATAR_NEUTRAL = '#7C8B88';

// FNV-1a: той самий userId завжди дає той самий колір на будь-якому пристрої
export default (id: string | null): string => {
    if (id === null) {
        return AVATAR_NEUTRAL;
    }

    let hash = 0x811C9DC5;

    for (let i = 0; i < id.length; i++) {
        hash ^= id.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }

    return AVATAR_COLORS[ (hash >>> 0) % AVATAR_COLORS.length ];
};
