/** Freeze each catalog once, including nested objects shared by consumers. */
export function freezeMessages<T extends object>(value: T): Readonly<T> {
  for (const child of Object.values(value)) {
    if (child !== null && typeof child === 'object' && !Object.isFrozen(child)) {
      freezeMessages(child);
    }
  }
  return Object.freeze(value);
}
