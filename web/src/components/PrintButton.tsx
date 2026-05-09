'use client'

import { Download } from 'lucide-react'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="no-print flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
    >
      <Download className="w-4 h-4 mr-2" />
      Скачать PDF
    </button>
  )
}
