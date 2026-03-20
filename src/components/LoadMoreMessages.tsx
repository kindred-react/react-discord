import { ChevronDown, Loader2 } from 'lucide-react'

interface LoadMoreMessagesProps {
  onLoadMore: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
}

export function LoadMoreMessages({ onLoadMore, hasMore, isLoading }: LoadMoreMessagesProps) {
  if (!hasMore) {
    return (
      <div className="flex justify-center py-2">
        <div className="text-[#949ba4] text-xs">已加载所有历史消息</div>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-2">
      <button
        onClick={onLoadMore}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#2b2d31] hover:bg-[#3f4147] text-[#b5bac1] hover:text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>加载中...</span>
          </>
        ) : (
          <>
            <ChevronDown size={14} />
            <span>加载更多历史消息</span>
          </>
        )}
      </button>
    </div>
  )
}
