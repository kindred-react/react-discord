import React from 'react'

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChangeText?: (text: string) => void
  placeholder?: string
}

const TextInput: React.FC<TextInputProps> = ({ 
  value, 
  onChangeText, 
  className,
  style,
  ...props 
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChangeText?.(e.target.value)}
      className={className}
      style={style as React.CSSProperties}
      {...props}
    />
  )
}

export default TextInput
