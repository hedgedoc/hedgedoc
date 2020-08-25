import React, { useCallback } from 'react'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../../redux'
import { setEditorSyncScroll } from '../../../../redux/editor/methods'
import disabledScroll from './disabledScroll.svg'
import enabledScroll from './enabledScroll.svg'

export const SyncScrollButton: React.FC = () => {
  const syncScroll: boolean = useSelector((state: ApplicationState) => state.editorConfig.syncScroll)
  const translation = syncScroll ? 'editor.appBar.syncScroll.enable' : 'editor.appBar.syncScroll.disable'
  const onClick = useCallback(() => {
    setEditorSyncScroll(!syncScroll)
  }, [syncScroll])

  const { t } = useTranslation()

  return (
    <ToggleButtonGroup type="checkbox" defaultValue={[]} name="sync-scroll" className="ml-2" value={[syncScroll]}>
      <ToggleButton
        title={ t(translation) }
        variant={syncScroll ? 'secondary' : 'light'}
        onChange={onClick} value={true}
      >
        <img src={syncScroll ? disabledScroll : enabledScroll} width={'20px'} alt={t(translation)}/>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
