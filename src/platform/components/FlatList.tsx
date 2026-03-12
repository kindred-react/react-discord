import React from 'react'

interface FlatListProps<T> {
  data: T[]
  renderItem: (item: { item: T; index: number }) => React.ReactNode
  keyExtractor?: (item: T, index: number) => string
  className?: string
  style?: React.CSSProperties
}

function FlatList<T>({ 
  data, 
  renderItem, 
  keyExtractor,
  className,
  style 
}: FlatListProps<T>): React.ReactElement {
  return (
    <div 
      className={className}
      style={style}
    >
      {data.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem({ item, index })}
        </div>
      ))}
    </div>
  )
}

export default FlatList
