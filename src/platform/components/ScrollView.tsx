import React from 'react'

interface ScrollViewProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const ScrollView: React.FC<ScrollViewProps> = ({ 
  children, 
  className,
  style,
  ...props 
}) => {
  return (
    <div 
      className={`overflow-y-auto ${className || ''}`}
      style={{ overflowY: 'auto', ...(style as React.CSSProperties) } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
}

export default ScrollView
