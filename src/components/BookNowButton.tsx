'use client'

import { useState } from 'react'
import BookingModal from './BookingModal'
import { logInquiry } from '@/actions/bookings'

export default function BookNowButton({ program }: { program: any }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = async () => {
    setIsOpen(true)
    // Log booking click inquiry
    await logInquiry(program.id, 'view')
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white text-md font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-center cursor-pointer"
      >
        اطلب حجز مكانك الآن
      </button>

      <BookingModal
        program={program}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
