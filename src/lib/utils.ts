/**
 * Selects a random element from an array.
 * @param array The array from which to select a random element.
 * @returns A random element from the array.
 */
export function selectRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
