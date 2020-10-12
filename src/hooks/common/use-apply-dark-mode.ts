import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'

export const useApplyDarkMode = ():void => {
  const darkModeActivated = useSelector((state: ApplicationState) => state.darkMode.darkMode)

  useEffect(() => {
    if (darkModeActivated) {
      window.document.body.classList.add('dark')
    } else {
      window.document.body.classList.remove('dark')
    }
    return () => {
      window.document.body.classList.remove('dark')
    }
  }, [darkModeActivated])
}
