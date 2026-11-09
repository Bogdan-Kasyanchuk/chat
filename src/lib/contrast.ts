// Відносна яскравість і контраст за WCAG 2.x, кольори — hex #RRGGBB
const channel = (value: number): number => {
    const c = value / 255;

    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number => {
    const n = Number.parseInt(hex.replace('#', ''), 16);

    return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};

export default (a: string, b: string): number => {
    const [ light, dark ] = [ luminance(a), luminance(b) ].sort((x, y) => y - x);

    return (light + 0.05) / (dark + 0.05);
};
