export function randBetween(from: number, to: number) {
    return from + Math.random() * (to - from);
}

export function randIntBetween(from: number, to: number) {
    return Math.floor(from + Math.random() * (to - from));
}