import { vi } from 'vitest'

// Mock useRouter
export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
}))

// Mock usePathname
export const usePathname = vi.fn(() => '/')

// Mock useSearchParams
export const useSearchParams = vi.fn(() => ({
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  forEach: vi.fn(),
  entries: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
  toString: vi.fn(),
}))

// Mock useParams
export const useParams = vi.fn(() => ({}))

// Set up the mocks
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation')
  return {
    ...actual,
    useRouter: () => useRouter(),
    usePathname: () => usePathname(),
    useSearchParams: () => useSearchParams(),
    useParams: () => useParams(),
  }
}) 