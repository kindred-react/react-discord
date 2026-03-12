import React from 'react'

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  source?: { uri: string } | string
}

const Image: React.FC<ImageProps> = ({ 
  source, 
  className,
  style,
  ...props 
}) => {
  const src = typeof source === 'object' ? source?.uri : source
  
  return (
    <img
      src={src}
      className={className}
      style={style as React.CSSProperties}
      {...props}
    />
  )
}

export default Image
