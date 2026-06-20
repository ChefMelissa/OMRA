import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveProgram, deleteProgram, updateProgramStatus } from '@/actions/programs'
import { createMockSupabase } from '../mocks/supabase'

let mockClient = createMockSupabase()
let mockAdminClient = createMockSupabase()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockClient,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockAdminClient,
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Program Server Actions', () => {
  beforeEach(() => {
    mockClient = createMockSupabase()
    mockAdminClient = createMockSupabase()
    vi.clearAllMocks()
  })

  const validProgramData = {
    title: 'برنامج العمرة الإيمانية المميز',
    description: 'تفاصيل البرنامج الكاملة',
    duration_days: 15,
    departure_date: '2026-08-01',
    return_date: '2026-08-16',
    departure_city: 'الجزائر',
    airline: 'Saudia',
    seats_available: 40,
    status: 'draft' as const,
    adult_commission: 15000,
    child_commission: 8000,
    flight_type: 'direct' as const,
    child_price: 110000,
    hotels: [
      { city: 'مكة' as const, hotel_name: 'فندق مكة أنوار', stars: 4, distance_meters: 400, nights: 10, board_basis: 'فطور' },
      { city: 'المدينة' as const, hotel_name: 'فندق طيبة', stars: 4, distance_meters: 150, nights: 4, board_basis: 'فطور' }
    ],
    room_prices: [
      { room_type: 'ثنائية' as const, price: 220000 },
      { room_type: 'ثلاثية' as const, price: 195000 }
    ],
    inclusions: ['تأشيرة', 'طيران', 'مزارات']
  }

  describe('saveProgram', () => {
    it('should fail if user is not authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const result = await saveProgram(validProgramData)
      expect(result).toEqual({ error: 'غير مصرح لك بإجراء هذه العملية' })
    })

    it('should fail if agency is not approved', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      mockClient._chain.single.mockResolvedValueOnce({
        data: { status: 'pending' },
        error: null,
      })

      const result = await saveProgram(validProgramData)
      expect(result).toEqual({ error: 'حساب الوكالة غير نشط أو لم يتم تفعيله بعد' })
    })

    it('should fail validation if title is too short', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      mockClient._chain.single.mockResolvedValueOnce({
        data: { status: 'approved' },
        error: null,
      })

      const result = await saveProgram({
        ...validProgramData,
        title: 'عمرة', // Too short (min 5 chars)
      })
      expect(result.error).toContain('عنوان البرنامج يجب أن يكون 5 أحرف على الأقل')
    })

    it('should insert a new program and relations successfully', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      // Agencies check
      mockClient._chain.single.mockResolvedValueOnce({
        data: { status: 'approved' },
        error: null,
      })

      // Program insert check
      mockAdminClient._chain.single.mockResolvedValueOnce({
        data: { id: 'new-program-id' },
        error: null,
      })

      // Mock insertions for relations (hotels, prices, inclusions)
      mockAdminClient._chain.then.mockImplementation((resolve) => resolve({ data: null, error: null }))

      const result = await saveProgram(validProgramData)
      expect(result).toEqual({ success: true, programId: 'new-program-id' })
    })

    it('should update an existing program and replace relations if program ID is provided', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      // 1. Agencies status check
      mockClient._chain.single.mockResolvedValueOnce({
        data: { status: 'approved' },
        error: null,
      })
      // 2. Program ownership check
      mockClient._chain.single.mockResolvedValueOnce({
        data: { agency_id: 'agency-1' },
        error: null,
      })

      // Mock update / delete operations succeeding
      mockAdminClient._chain.then.mockImplementation((resolve) => resolve({ data: null, error: null }))

      const result = await saveProgram({
        ...validProgramData,
        id: 'existing-program-id'
      })

      expect(result).toEqual({ success: true, programId: 'existing-program-id' })
      expect(mockAdminClient.from).toHaveBeenCalledWith('program_hotels')
    })
  })

  describe('deleteProgram', () => {
    it('should restrict program deletion to the owner', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      // Program belongs to agency-2
      mockClient._chain.single.mockResolvedValueOnce({
        data: { agency_id: 'agency-2' },
        error: null,
      })

      const result = await deleteProgram('program-id')
      expect(result).toEqual({ error: 'البرنامج غير موجود أو لا يخص هذه الوكالة' })
    })

    it('should delete program if owned', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      mockClient._chain.single.mockResolvedValueOnce({
        data: { agency_id: 'agency-1' },
        error: null,
      })
      // Delete call resolves
      mockAdminClient._chain.then.mockImplementationOnce((resolve) => resolve({ data: null, error: null }))

      const result = await deleteProgram('program-id')
      expect(result).toEqual({ success: true })
      expect(mockAdminClient.from).toHaveBeenCalledWith('programs')
    })
  })

  describe('updateProgramStatus', () => {
    it('should update status successfully if owner', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      mockClient._chain.single.mockResolvedValueOnce({
        data: { agency_id: 'agency-1' },
        error: null,
      })
      // Update call resolves
      mockAdminClient._chain.then.mockImplementationOnce((resolve) => resolve({ data: null, error: null }))

      const result = await updateProgramStatus('program-id', 'active')
      expect(result).toEqual({ success: true })
      expect(mockAdminClient.from).toHaveBeenCalledWith('programs')
    })
  })
})
