export function shallow<T>(a: T, b: T): boolean {
    if (Object.is(a, b)) {
        return true;
    }

    if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
        return false;
    }

    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
        return false;
    }

    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) {
        return false;
    }

    const recordA = a as Record<string, unknown>;
    const recordB = b as Record<string, unknown>;

    return keysA.every((key) => Object.hasOwn(recordB, key) && Object.is(recordA[key], recordB[key]));
}
