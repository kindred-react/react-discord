import { Monitor, Apple, Smartphone, X } from 'lucide-react'
import { useEffect } from 'react'

interface DownloadAppModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
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
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#313338] rounded-lg shadow-xl w-[680px] max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with banner image */}
        <div className="relative h-32 bg-gradient-to-r from-[#5865f2] to-[#7289da]">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 bg-[#5865f2] rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl font-bold">D</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="pt-12 pb-6 px-6">
          <h2 className="text-2xl font-bold text-white mb-2">下载 Discord 应用</h2>
          <p className="text-[#949ba4] mb-6">
            随时随地与朋友和社区保持联系。下载适用于 Windows、Mac、Linux、iOS 和 Android 的 Discord 应用。
          </p>

          {/* Download Options */}
          <div className="grid grid-cols-3 gap-4">
            {/* Windows */}
            <button className="flex flex-col items-center gap-3 p-4 bg-[#1e1f22] rounded-lg hover:bg-[#35373c] transition-colors group">
              <Monitor size={32} className="text-[#5865f2]" />
              <div className="text-center">
                <div className="text-white font-medium">Windows</div>
                <div className="text-xs text-[#949ba4]">Windows 10 及以上</div>
              </div>
              <div className="text-[#5865f2] text-sm font-medium group-hover:underline">
                下载
              </div>
            </button>

            {/* Mac */}
            <button className="flex flex-col items-center gap-3 p-4 bg-[#1e1f22] rounded-lg hover:bg-[#35373c] transition-colors group">
              <Apple size={32} className="text-[#5865f2]" />
              <div className="text-center">
                <div className="text-white font-medium">macOS</div>
                <div className="text-xs text-[#949ba4]">Apple Silicon</div>
              </div>
              <div className="text-[#5865f2] text-sm font-medium group-hover:underline">
                下载
              </div>
            </button>

            {/* iOS */}
            <button className="flex flex-col items-center gap-3 p-4 bg-[#1e1f22] rounded-lg hover:bg-[#35373c] transition-colors group">
              <Smartphone size={32} className="text-[#5865f2]" />
              <div className="text-center">
                <div className="text-white font-medium">iOS</div>
                <div className="text-xs text-[#949ba4]">iOS 13.0 及以上</div>
              </div>
              <div className="text-[#5865f2] text-sm font-medium group-hover:underline">
                在 App Store 下载
              </div>
            </button>
          </div>

          {/* Linux */}
          <div className="mt-4 p-4 bg-[#1e1f22] rounded-lg flex items-center justify-between hover:bg-[#35373c] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Monitor size={24} className="text-[#5865f2]" />
              <div>
                <div className="text-white font-medium">Linux</div>
                <div className="text-xs text-[#949ba4]">Debian-based distributions</div>
              </div>
            </div>
            <div className="text-[#5865f2] text-sm font-medium hover:underline">
              下载
            </div>
          </div>

          {/* Mobile QR Code */}
          <div className="mt-6 p-4 bg-[#1e1f22] rounded-lg flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
              <div className="w-16 h-16 bg-[#5865f2] rounded flex items-center justify-center">
                <Smartphone size={24} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-white font-medium mb-1">在手机上获取 Discord</div>
              <div className="text-xs text-[#949ba4]">
                扫描二维码下载 iOS 或 Android 应用
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
