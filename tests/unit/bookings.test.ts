import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBookingRequest, updateBookingStatus, adminApproveBooking, logInquiry } from '@/actions/bookings'
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

describe('Booking Server Actions', () => {
  beforeEach(() => {
    mockClient = createMockSupabase()
    mockAdminClient = createMockSupabase()
    vi.clearAllMocks()
  })

  describe('createBookingRequest', () => {
    const validBooking = {
      program_id: 'a0000000-0000-4000-8000-000000000001', // Valid RFC4122 v4 UUID
      customer_name: 'محمد بن احمد',
      customer_phone: '0550123456',
      is_whatsapp: true,
      room_type: 'ثنائية' as const,
      notes: 'ملاحظة تجريبية',
      adults_count: 1,
      children_count: 0,
    }

    it('should fail if name is too short', async () => {
      const result = await createBookingRequest({
        ...validBooking,
        customer_name: 'علي', // Too short (min 4 chars)
      })
      expect(result).toEqual({ error: 'الاسم الكامل يجب أن يكون 4 أحرف على الأقل' })
    })

    it('should fail if phone is too short', async () => {
      const result = await createBookingRequest({
        ...validBooking,
        customer_phone: '123',
      })
      expect(result).toEqual({ error: 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل' })
    })

    it('should fail if program does not exist', async () => {
      mockAdminClient._chain.single.mockResolvedValueOnce({ data: null, error: null }) // no program found

      const result = await createBookingRequest(validBooking)
      expect(result).toEqual({ error: 'البرنامج المطلوب غير متوفر أو تم حذفه' })
    })

    it('should fail if program is not active', async () => {
      mockAdminClient._chain.single.mockResolvedValueOnce({
        data: { agency_id: 'agency-1', status: 'draft' },
        error: null,
      })

      const result = await createBookingRequest(validBooking)
      expect(result).toEqual({ error: 'عذراً، هذا البرنامج غير متاح حالياً للحجز' })
    })

    it('should generate reference, insert booking and return success details', async () => {
      // 1. Program details query
      mockAdminClient._chain.single.mockResolvedValueOnce({
        data: { agency_id: 'agency-1', status: 'active' },
        error: null,
      })

      // 2. Reference number lookup (returns null, i.e., unique)
      mockAdminClient._chain.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // 3. Insert and return details query
      mockAdminClient._chain.single.mockResolvedValueOnce({
        data: { id: 'booking-id', reference_number: 'UMR-123456' },
        error: null,
      })

      const result = await createBookingRequest(validBooking)
      expect(result.success).toBe(true)
      expect(result.referenceNumber).toBeDefined()
      expect(result.booking).toBeDefined()
    })
  })

  describe('updateBookingStatus', () => {
    it('should fail if user is not logged in', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const result = await updateBookingStatus('booking-123', 'contacted')
      expect(result).toEqual({ error: 'غير مصرح لك' })
    })

    it('should fail if booking does not exist or does not belong to agency', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      // Simulated select returns a booking belonging to agency-2
      mockClient._setQueryData({ agency_id: 'agency-2' })

      const result = await updateBookingStatus('booking-123', 'contacted')
      expect(result).toEqual({ error: 'طلب الحجز غير موجود أو لا ينتمي لوكالتك' })
    })

    it('should fail if status is booked but booking value is missing or <= 0', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      mockClient._setQueryData({ agency_id: 'agency-1' })

      const result = await updateBookingStatus('booking-123', 'booked', 0)
      expect(result).toEqual({ error: 'الرجاء إدخال قيمة الحجز الفعلية بالدينار الجزائري لتأكيد الحجز' })
    })

    it('should update status and return success', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      mockClient._setQueryData({ agency_id: 'agency-1' })
      mockAdminClient._setQueryData(null) // Mock successful update query returns no errors

      const result = await updateBookingStatus('booking-123', 'booked', 180000)
      expect(result).toEqual({ success: true })
    })

    it('should save booking_value and set admin_approval to pending when status is booked', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      
      // First single check: select from booking_requests
      mockClient._chain.single.mockResolvedValueOnce({
        data: { agency_id: 'agency-1', program_id: 'program-123', room_type: 'ثنائية' },
        error: null
      })
      
      // Update check
      mockAdminClient._chain.then.mockImplementationOnce((resolve) => resolve({ data: null, error: null }))

      const result = await updateBookingStatus('booking-123', 'booked', 180000)
      expect(result).toEqual({ success: true })
      
      // Verify update payload contains booking_value and admin_approval
      expect(mockAdminClient.from).toHaveBeenCalledWith('booking_requests')
      expect(mockAdminClient._chain.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'booked',
        booking_value: 180000,
        admin_approval: 'pending'
      }))
    })
  })

  describe('adminApproveBooking', () => {
    it('should restrict access to logged in users', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const result = await adminApproveBooking('booking-123', 'approved')
      expect(result).toEqual({ error: 'غير مصرح لك' })
    })

    it('should restrict access to admin role only', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'agency-1' } }, error: null })
      // profile returns agency role
      mockClient._setQueryData({ role: 'agency' })

      const result = await adminApproveBooking('booking-123', 'approved')
      expect(result).toEqual({ error: 'صلاحيات غير كافية، هذه العملية للمشرفين فقط' })
    })

    it('should fail if booking is not in booked status', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } }, error: null })
      // First single check is profiles role
      mockClient._chain.single.mockResolvedValueOnce({ data: { role: 'admin' }, error: null })
      // Second single check is booking status
      mockAdminClient._chain.single.mockResolvedValueOnce({
        data: { status: 'contacted', booking_value: null },
        error: null,
      })

      const result = await adminApproveBooking('booking-123', 'approved')
      expect(result).toEqual({ error: 'يمكن فقط اعتماد أو رفض الطلبات التي قامت الوكالة بتعليمها كـ "تم الحجز"' })
    })

    it('should approve booking successfully', async () => {
      mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } }, error: null })
      // First single check is profiles role
      mockClient._chain.single.mockResolvedValueOnce({ data: { role: 'admin' }, error: null })
      // Second single check is booking status
      mockAdminClient._chain.single.mockResolvedValueOnce({
        data: { status: 'booked', booking_value: 180000 },
        error: null,
      })
      // Update check
      mockAdminClient._chain.then.mockImplementationOnce((resolve) => resolve({ data: null, error: null }))

      const result = await adminApproveBooking('booking-123', 'approved')
      expect(result).toEqual({ success: true })
    })
  })

  describe('logInquiry', () => {
    it('should insert inquiry data successfully', async () => {
      mockAdminClient._chain.then.mockImplementationOnce((resolve) => resolve({ data: null, error: null }))

      const result = await logInquiry('program-123', 'view')
      expect(result).toEqual({ success: true })
      expect(mockAdminClient.from).toHaveBeenCalledWith('inquiries')
    })
  })
})
