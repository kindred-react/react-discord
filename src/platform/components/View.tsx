import React from 'react'

interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const View: React.FC<ViewProps> = ({ 
  children, 
  style, 
  className,
  ...props 
}) => {
  return (
    <div 
      className={className} 
      style={style as React.CSSProperties} 
      {...props}
    >
      {children}
    </div>
  )
}

export default View
