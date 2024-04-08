export function generateSlug(text: string): string {
    // Step 1: Trim leading and trailing whitespace
    const trimmedText = text.trim();

    // Step 2: Normalize the string to separate characters from diacritics
    const normalizedText = trimmedText.normalize("NFD");

    // Step 3: Remove diacritics and normalize characters to lowercase
    const cleanedText = normalizedText
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .toLowerCase(); // Convert to lowercase

    // Step 4: Remove non-alphabetic characters, replace whitespace with hyphens
    const slugText = cleanedText
        .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters except whitespace
        .replace(/\s+/g, '-') // Replace whitespace with hyphens

    // Step 5: Return the processed string (slug)
    return slugText;
}
