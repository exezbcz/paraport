type ConvertToBigInt<T, K extends keyof T> = {
	[P in keyof T]: P extends K ? (T[P] extends string ? bigint : T[P]) : T[P]
}

export const convertToBigInt = <
	T extends Record<string, any>,
	K extends keyof T,
>(
	obj: T,
	keys: K[],
): ConvertToBigInt<T, K> => {
	const result = { ...obj }

	for (const key of keys) {
		if (key in obj && typeof obj[key] === 'string') {
			result[key] = BigInt(obj[key]) as any
		}
	}

	return result as ConvertToBigInt<T, K>
}
