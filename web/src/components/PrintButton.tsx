'use client'

import { Download } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print flex items-center px-4 py-2 bg-[#00A859] hover:bg-[#007A40] text-white font-semibold rounded-[8px] transition-colors bcc-shadow"
    >
      <Download className="w-4 h-4 mr-2" strokeWidth={1.75} />
      Скачать PDF
    </button>
  )
}
