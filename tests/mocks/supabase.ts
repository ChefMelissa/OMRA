import { vi } from 'vitest'

export const createMockSupabase = () => {
  let queryResultData: any = null
  let queryResultError: any = null

  const chain = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  }

  // Make all chaining methods return the chain itself
  chain.select.mockReturnValue(chain)
  chain.insert.mockReturnValue(chain)
  chain.update.mockReturnValue(chain)
  chain.delete.mockReturnValue(chain)
  chain.upsert.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.in.mockReturnValue(chain)

  chain.single.mockImplementation(async () => {
    return { data: queryResultData, error: queryResultError }
  })
  chain.maybeSingle.mockImplementation(async () => {
    return { data: queryResultData, error: queryResultError }
  })
  chain.then.mockImplementation((resolve) => {
    return Promise.resolve(resolve({ data: queryResultData, error: queryResultError }))
  })

  const client = {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'new-user-id', email: 'new@example.com' } },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      admin: {
        listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
        createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user-id' } }, error: null }),
        deleteUser: vi.fn().mockResolvedValue({ error: null }),
      },
    },
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
    // Helper helpers to dynamically alter response data
    _setQueryData: (data: any) => {
      queryResultData = data
      queryResultError = null
    },
    _setQueryError: (error: any) => {
      queryResultData = null
      queryResultError = error
    },
  }

  return client
}
