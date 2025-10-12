/**
 * Extracts the union of the values of an object type.
 */
export type ObjectValues<T> = T[keyof T]
