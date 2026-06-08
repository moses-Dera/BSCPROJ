/** Express route params are typed as string | string[] — this safely extracts a single string */
export function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value
}
