export default (name: string) => name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[ 0 ]?.toUpperCase() ?? '')
    .join('') || '?';
