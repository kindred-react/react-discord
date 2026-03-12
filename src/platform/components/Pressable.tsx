import React from 'react'

interface PressableProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  onPress?: () => void
}

const Pressable: React.FC<PressableProps> = ({ 
  children, 
  onPress,
  className,
  style,
  ...props 
}) => {
  return (
    <button
      type="button"
      onClick={onPress}
      className={className}
      style={style as React.CSSProperties}
      {...props}
    >
      {children}
    </button>
  )
}

export default Pressable
