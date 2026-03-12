import React from 'react'

interface StatusBarProps {
  barStyle?: 'light-content' | 'dark-content'
  backgroundColor?: string
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  barStyle = 'light-content',
  backgroundColor = '#202225'
}) => {
  return (
    <div 
      style={{ 
        backgroundColor,
        height: 24,
        width: '100%',
      }}
      data-bar-style={barStyle}
    />
  )
}
