/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState, useMemo } from 'react'
import type { ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { Trans, useTranslation } from 'react-i18next'
import { Button, FormControl, FormGroup, FormLabel, Modal, Alert, Spinner, Form } from 'react-bootstrap'
import { useNoteMarkdownContent } from '../../../../../hooks/common/use-note-markdown-content'
import { Lightbulb as IconLightbulb } from 'react-bootstrap-icons'
import { MarkdownToReact } from '../../../../markdown-renderer/markdown-to-react/markdown-to-react'
import { useMarkdownExtensions } from '../../../../markdown-renderer/hooks/use-markdown-extensions'
import { RendererType } from '../../../../render-page/window-post-message-communicator/rendering-message'
import { useDarkModeState } from '../../../../../hooks/dark-mode/use-dark-mode-state'

interface SummaryModalProps extends ModalVisibilityProps {}

type SummaryLength = 'short' | 'medium' | 'long'

/**
 * Modal component for generating AI summaries with fullscreen layout.
 */
export const SummaryModal: React.FC<SummaryModalProps> = ({ show, onHide }) => {
  const { t } = useTranslation()
  const markdownContent = useNoteMarkdownContent()
  const [summary, setSummary] = useState('')
  const [issues, setIssues] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium')
  
  const extensions = useMarkdownExtensions('/', RendererType.SIMPLE, [])
  const isDarkMode = useDarkModeState()
  const resultBoxStyle = useMemo(
    () =>
      isDarkMode
        ? {
            backgroundColor: '#1f1f1f',
            color: '#f8f9fa',
            border: '1px solid rgba(255,255,255,0.15)'
          }
        : {
            backgroundColor: '#f8f9fa',
            color: '#212529',
            border: '1px solid rgba(0,0,0,0.05)'
          },
    [isDarkMode]
  )
  
  // Convert summary text to markdown lines for rendering
  const summaryLines = useMemo(() => (summary ? summary.split('\n') : []), [summary])
  const issuesLines = useMemo(() => (issues ? issues.split('\n') : []), [issues])

  const handleGenerateSummary = useCallback(async () => {
    if (!markdownContent) {
      setError(t('editor.modal.summary.missingText') ?? 'No content to summarize')
      return
    }

    setIsLoading(true)
    setError(null)
    setSummary('')

    try {
      const response = await fetch('/api/private/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: markdownContent, length: summaryLength }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the summary')
    } finally {
      setIsLoading(false)
    }
  }, [markdownContent, summaryLength, t])

  const handleCheckForErrors = useCallback(async () => {
    if (!markdownContent) {
      setError(t('editor.modal.summary.missingText') ?? 'No content to check')
      return
    }

    setIsChecking(true)
    setError(null)
    setIssues('')

    try {
      const response = await fetch('/api/private/summary/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: markdownContent })
      })

      if (!response.ok) {
        throw new Error(t('editor.modal.summary.checkError') ?? 'Failed to check for issues')
      }

      const data = await response.json()
      setIssues(data.issues || (t('editor.modal.summary.issuesNone') ?? 'No issues found.'))
    } catch (err) {
      setError(err instanceof Error ? err.message : (t('editor.modal.summary.checkError') ?? 'Failed to check for issues'))
    } finally {
      setIsChecking(false)
    }
  }, [markdownContent, t])

  return (
    <Modal show={show} onHide={onHide} size="xl" centered dialogClassName="modal-90w">
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title>
          <IconLightbulb className="me-2" />
          <Trans i18nKey='editor.modal.summary.title' />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0" style={{ height: '80vh' }}>
        <div className="d-flex h-100">
          {/* Left Panel - Controls */}
          <div className="border-end p-4" style={{ width: '300px', overflowY: 'auto', flexShrink: 0 }}>
            <h5 className="mb-4">
              <Trans i18nKey='editor.modal.summary.controls' />
            </h5>

            {/* Summary Length Selection */}
            <FormGroup className='mb-4'>
              <FormLabel>
                <Trans i18nKey='editor.modal.summary.lengthLabel' />
              </FormLabel>
              <Form.Select
                value={summaryLength}
                onChange={(e) => setSummaryLength(e.target.value as SummaryLength)}>
                <option value='short'>
                  {t('editor.modal.summary.lengthShort') ?? 'Short'}
                </option>
                <option value='medium'>
                  {t('editor.modal.summary.lengthMedium') ?? 'Medium'}
                </option>
                <option value='long'>
                  {t('editor.modal.summary.lengthLong') ?? 'Long'}
                </option>
              </Form.Select>
            </FormGroup>

            {/* Action Buttons */}
            <div className='d-flex flex-column gap-3'>
              <Button 
                onClick={handleGenerateSummary} 
                disabled={isLoading || !markdownContent}
                variant="primary"
                className="text-nowrap">
                {isLoading ? (
                  <>
                    <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' className='me-2' />
                    <span className="d-inline-block text-truncate" style={{ maxWidth: '150px' }}>
                      <Trans i18nKey='editor.modal.summary.generating' />
                    </span>
                  </>
                ) : (
                  <Trans i18nKey='editor.modal.summary.generate' />
                )}
              </Button>

              <Button
                variant='outline-primary'
                onClick={handleCheckForErrors}
                disabled={isChecking || !markdownContent}
                className="text-nowrap">
                {isChecking ? (
                  <>
                    <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' className='me-2' />
                    <span className="d-inline-block text-truncate" style={{ maxWidth: '150px' }}>
                      <Trans i18nKey='editor.modal.summary.checking' />
                    </span>
                  </>
                ) : (
                  <Trans i18nKey='editor.modal.summary.check' />
                )}
              </Button>
            </div>

            {error && (
              <Alert variant='danger' dismissible onClose={() => setError(null)} className="mt-3">
                {error}
              </Alert>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
            {!summary && !issues && (
              <div className="text-center text-muted mt-5">
                <IconLightbulb size={48} className="mb-3" />
                <p>
                  <Trans i18nKey='editor.modal.summary.placeholder' />
                </p>
              </div>
            )}

            {summary && (
              <div className='mb-4'>
                <h5 className="mb-3">
                  <Trans i18nKey='editor.modal.summary.result' />
                </h5>
                <div className="p-3 rounded markdown-body" style={resultBoxStyle}>
                  <MarkdownToReact
                    markdownContentLines={summaryLines}
                    markdownRenderExtensions={extensions}
                    newlinesAreBreaks={true}
                    allowHtml={false}
                  />
                </div>
              </div>
            )}

            {issues && (
              <div className='mb-4'>
                <h5 className="mb-3">
                  <Trans i18nKey='editor.modal.summary.issuesResult' />
                </h5>
                <div className="p-3 rounded markdown-body" style={resultBoxStyle}>
                  <MarkdownToReact
                    markdownContentLines={issuesLines}
                    markdownRenderExtensions={extensions}
                    newlinesAreBreaks={true}
                    allowHtml={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}
