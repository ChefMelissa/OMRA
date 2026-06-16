import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, registerAgency, logout, updateAgencyProfile } from '@/actions/auth'
import { createMockSupabase } from '../mocks/supabase'

let mockClient = createMockSupabase()
let mockAdminClient = createMockSupabase()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockClient,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}))

const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Authentication Server Actions', () => {
  beforeEach(() => {
    mockClient = createMockSupabase()
    mockAdminClient = createMockSupabase()
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should return validation error for invalid email', async () => {
      const formData = new FormData()
      formData.append('email', 'invalid-email')
      formData.append('password', 'password123')

      const result = await login({}, formData)
      expect(result).toEqual({ error: 'البريد الإلكتروني غير صالح' })
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('should return validation error for short password', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', '123')

      const result = await login({}, formData)
      expect(result).toEqual({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
    })

    it('should return error if signInWithPassword fails', async () => {
      mockClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials' } as any,
      })

      const formData = new FormData()
      formData.append('email', 'wrong@example.com')
      formData.append('password', 'password123')

      const result = await login({}, formData)
      expect(result).toEqual({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
    })

    it('should redirect to agency dashboard for agency role', async () => {
      mockClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'agency-id' } },
        error: null,
      })
      mockClient._setQueryData({ role: 'agency' })

      const formData = new FormData()
      formData.append('email', 'agency@example.com')
      formData.append('password', 'password123')

      try {
        await login({}, formData)
      } catch (e) {
        // NextJS redirect throws a redirect error which is expected
      }

      expect(mockRedirect).toHaveBeenCalledWith('/agency/dashboard')
    })

    it('should redirect to admin dashboard for admin role', async () => {
      mockClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'admin-id' } },
        error: null,
      })
      mockClient._setQueryData({ role: 'admin' })

      const formData = new FormData()
      formData.append('email', 'admin@example.com')
      formData.append('password', 'password123')

      try {
        await login({}, formData)
      } catch (e) {
        // NextJS redirect throws
      }

      expect(mockRedirect).toHaveBeenCalledWith('/admin/dashboard')
    })
  })

  describe('registerAgency', () => {
    it('should return validation error for missing field', async () => {
      const formData = new FormData()
      formData.append('email', 'agency@example.com')
      formData.append('password', 'password123')
      // Missing name, licenseNumber, etc.

      const result = await registerAgency({}, formData)
      expect(result.error).toBeDefined()
    })

    it('should handle signUp errors from Supabase', async () => {
      mockClient.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'User already exists' } as any,
      })

      const formData = new FormData()
      formData.append('email', 'exists@example.com')
      formData.append('password', 'password123')
      formData.append('name', 'وكالة التجربة')
      formData.append('licenseNumber', 'LIC-100')
      formData.append('city', 'الجزائر')
      formData.append('phone', '0550123456')
      formData.append('whatsapp', '0550123456')

      const result = await registerAgency({}, formData)
      expect(result).toEqual({ error: 'User already exists' })
    })

    it('should perform cleanup and delete profile if agency table insertion fails', async () => {
      mockClient.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'new-user-id' } },
        error: null,
      })
      // upsert profiles succeeds, insert agencies fails, cleanup delete succeeds
      mockAdminClient._chain.then
        .mockImplementationOnce((resolve) => resolve({ data: null, error: null }))
        .mockImplementationOnce((resolve) => resolve({ data: null, error: { message: 'Database constraint error' } }))
        .mockImplementationOnce((resolve) => resolve({ data: null, error: null }))

      const formData = new FormData()
      formData.append('email', 'fail-agency@example.com')
      formData.append('password', 'password123')
      formData.append('name', 'وكالة الفشل')
      formData.append('licenseNumber', 'LIC-999')
      formData.append('city', 'الجزائر')
      formData.append('phone', '0550123456')
      formData.append('whatsapp', '0550123456')

      const result = await registerAgency({}, formData)
      expect(result.error).toContain('Database constraint error')
      // cleanup should be triggered
      expect(mockAdminClient.from).toHaveBeenCalledWith('profiles')
      expect(mockAdminClient.from().delete).toHaveBeenCalled()
    })

    it('should redirect to agency status upon successful registration', async () => {
      mockClient.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'success-user-id' } },
        error: null,
      })
      // upsert profiles succeeds, insert agencies succeeds
      mockAdminClient._chain.then
        .mockImplementationOnce((resolve) => resolve({ data: null, error: null }))
        .mockImplementationOnce((resolve) => resolve({ data: null, error: null }))

      const formData = new FormData()
      formData.append('email', 'success@example.com')
      formData.append('password', 'password123')
      formData.append('name', 'وكالة النجاح')
      formData.append('licenseNumber', 'LIC-777')
      formData.append('city', 'الجزائر')
      formData.append('phone', '0550123456')
      formData.append('whatsapp', '0550123456')

      try {
        await registerAgency({}, formData)
      } catch (e) {
        // NextJS redirect throws
      }

      expect(mockRedirect).toHaveBeenCalledWith('/agency/status')
    })
  })

  describe('logout', () => {
    it('should sign out and redirect to login', async () => {
      try {
        await logout()
      } catch (e) {
        // NextJS redirect throws
      }

      expect(mockClient.auth.signOut).toHaveBeenCalled()
      expect(mockRedirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('updateAgencyProfile', () => {
    it('should return error if unauthorized', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const formData = new FormData()
      const result = await updateAgencyProfile({}, formData)
      expect(result).toEqual({ error: 'غير مصرح لك' })
    })

    it('should return error for missing parameters', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'agency-id' } },
        error: null,
      })

      const formData = new FormData()
      formData.append('name', '') // missing required
      const result = await updateAgencyProfile({}, formData)
      expect(result.error).toBeDefined()
    })

    it('should update profile and return success message', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'agency-id' } },
        error: null,
      })
      mockAdminClient._chain.then.mockImplementationOnce((resolve) => resolve({ data: null, error: null }))

      const formData = new FormData()
      formData.append('name', 'اسم جديد للوكالة')
      formData.append('description', 'وصف جديد')
      formData.append('city', 'وهران')
      formData.append('phone', '0550112233')
      formData.append('whatsapp', '0550112233')

      const result = await updateAgencyProfile({}, formData)
      expect(result).toEqual({ success: 'تم تحديث بيانات الملف الشخصي بنجاح!' })
      expect(mockAdminClient.from).toHaveBeenCalledWith('agencies')
    })
  })
})
