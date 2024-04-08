import ShortUniqueId from "short-unique-id";

export function generateShortId(length=10): string{
    const shortId = new ShortUniqueId({ length}).rnd();
    return shortId
}