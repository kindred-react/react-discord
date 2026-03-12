import React from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  visible: boolean
  onClose?: () => void
  children?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ 
  visible, 
  onClose, 
  children 
}) => {
  if (!visible) return null

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose()
        }
      }}
    >
      <div className="bg-[#2f3136] rounded-lg shadow-xl max-w-md w-full mx-4">
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Modal
