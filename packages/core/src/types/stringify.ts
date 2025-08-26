/**
 * Converts enum values to their string literal equivalents.
 * This type utility enhances type safety while allowing string values to be passed as parameters.
 *
 * @example
 * enum Status { Active = 'ACTIVE', Inactive = 'INACTIVE' }
 * type StringifiedStatus = Stringify<Status>; // 'ACTIVE' | 'INACTIVE'
 */
export type Stringify<T> = T extends Record<string | number, string>
	? T[keyof T]
	: T
