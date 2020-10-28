import { useEffect, useState } from 'react'

export const useFirstDraw = ():boolean => {
  const [firstDraw, setFirstDraw] = useState(true)

  useEffect(() => {
    setFirstDraw(false)
  }, [])

  return firstDraw
}
