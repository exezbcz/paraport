type ConvertToBigInt<T, K extends keyof T> = {
	[P in keyof T]: P extends K ? (T[P] extends string ? bigint : T[P]) : T[P]
}

export const convertToBigInt = <
	T extends Record<string, unknown>,
	K extends keyof T & string,
>(
	obj: T,
	keys: readonly K[],
): ConvertToBigInt<T, K> => {
	const result = { ...obj }

	for (const key of keys) {
		if (key in obj && typeof obj[key] === 'string') {
			const partialResult: Partial<ConvertToBigInt<T, K>> = {}

			partialResult[key] = BigInt(obj[key] as string) as ConvertToBigInt<
				T,
				K
			>[K]

			Object.assign(result, partialResult)
		}
	}

	return result as ConvertToBigInt<T, K>
}
