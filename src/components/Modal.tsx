import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#313338] rounded-[4px] shadow-2xl w-[440px] max-h-[85vh] flex flex-col"
        style={{ animation: 'modalIn 0.2s ease' }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-1">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-white leading-tight">{title}</h2>
            <button
              onClick={onClose}
              className="ml-3 mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[#80848e] hover:text-[#dbdee1] hover:bg-[#3f4147] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-5 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
      `}</style>
    </div>
  )
}
