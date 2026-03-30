import { useState, useEffect } from "react"

// 제네릭 디바운스 훅
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay)
		return () => clearTimeout(timer)
	}, [value, delay])

	return debouncedValue
}
