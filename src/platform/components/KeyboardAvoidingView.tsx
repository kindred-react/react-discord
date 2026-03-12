import React from 'react'

interface KeyboardAvoidingViewProps {
  children?: React.ReactNode
  behavior?: 'padding' | 'height' | 'position'
}

const KeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> = ({ 
  children,
  behavior = 'padding'
}) => {
  return (
    <div 
      style={{ 
        flex: 1,
        paddingBottom: behavior === 'padding' ? 300 : 0 
      }}
    >
      {children}
    </div>
  )
}

export default KeyboardAvoidingView
