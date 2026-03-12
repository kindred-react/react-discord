import React from 'react'

interface ActivityIndicatorProps {
  size?: 'small' | 'large'
  color?: string
}

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ 
  size = 'small',
  color = '#5865f2' 
}) => {
  const sizeValue = size === 'small' ? 20 : 40
  
  return (
    <div 
      style={{
        width: sizeValue,
        height: sizeValue,
        border: '3px solid rgba(0,0,0,0.1)',
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ActivityIndicator
