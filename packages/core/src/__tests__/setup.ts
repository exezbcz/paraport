import { afterEach, vi } from 'vitest'

// Mock crypto for UUID generation
vi.stubGlobal('crypto', {
	randomUUID: () => '00000000-0000-0000-0000-000000000000',
})

// Mock console methods to keep test output clean
vi.spyOn(console, 'debug').mockImplementation(() => {})
vi.spyOn(console, 'info').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})

// Reset all mocks after each test
afterEach(() => {
	vi.clearAllMocks()
})
