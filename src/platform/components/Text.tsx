import React from 'react'

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

const Text: React.FC<TextProps> = ({ 
  children, 
  style, 
  className,
  ...props 
}) => {
  return (
    <span 
      className={className} 
      style={style as React.CSSProperties} 
      {...props}
    >
      {children}
    </span>
  )
}

export default Text
