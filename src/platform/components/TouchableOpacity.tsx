import React from 'react'

interface TouchableOpacityProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  onPress?: () => void
  activeOpacity?: number
}

const TouchableOpacity: React.FC<TouchableOpacityProps> = ({ 
  children, 
  onPress,
  className,
  style,
  activeOpacity = 0.7,
  ...props 
}) => {
  return (
    <button
      type="button"
      onClick={onPress}
      className={className}
      style={{ 
        ...(style as React.CSSProperties),
        opacity: 1,
        transition: `opacity ${activeOpacity * 100}ms`,
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </button>
  )
}

export default TouchableOpacity
