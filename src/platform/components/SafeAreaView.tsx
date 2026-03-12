import React from 'react'

interface SafeAreaViewProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({ 
  children,
  className,
  style 
}) => {
  return (
    <div 
      className={className}
      style={{ 
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        ...style 
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
