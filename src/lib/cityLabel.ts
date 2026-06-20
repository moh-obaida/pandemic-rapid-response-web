/** Short label for flight-path city markers — readable at small sizes. */
export function abbreviateCity(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return words.map((w) => w[0]).join('').toUpperCase()
  }
  if (name.length <= 5) return name
  return name.slice(0, 4)
}
