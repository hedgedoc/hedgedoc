/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState, useMemo } from 'react'
import type { ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { CommonModal } from '../../../../common/modals/common-modal'
import { Trans, useTranslation } from 'react-i18next'
import { Button, FormControl, FormGroup, FormLabel, Modal, Alert, Spinner } from 'react-bootstrap'
import { useNoteMarkdownContent } from '../../../../../hooks/common/use-note-markdown-content'
import { Lightbulb as IconLightbulb } from 'react-bootstrap-icons'

interface SummaryModalProps extends ModalVisibilityProps {}

/**
 * Modal component for generating AI summaries of selected paragraphs.
 */
export const SummaryModal: React.FC<SummaryModalProps> = ({ show, onHide }) => {
  const { t } = useTranslation()
  const markdownContent = useNoteMarkdownContent()
  const [selectedText, setSelectedText] = useState('')
  const [summary, setSummary] = useState('')
  const [issues, setIssues] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Split markdown into paragraphs (by double newlines or headers)
  const paragraphs = useMemo(() => {
    return markdownContent
      .split(/\n\n+/)
      .map((p, index) => ({ id: index, text: p.trim() }))
      .filter((p) => p.text.length > 0)
  }, [markdownContent])

  const handleGenerateSummary = useCallback(async () => {
    if (!selectedText) {
      setError(t('editor.modal.summary.missingText') ?? 'Please enter or select text first')
      return
    }

    setIsLoading(true)
    setError(null)
    setSummary('')
    setIssues('')

    try {
      const response = await fetch('/api/private/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: selectedText }),
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
  }, [selectedText, t])

  const handleCheckForErrors = useCallback(async () => {
    if (!selectedText) {
      setError(t('editor.modal.summary.missingText') ?? 'Please enter or select text first')
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
        body: JSON.stringify({ text: selectedText })
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
  }, [selectedText, t])

  const handleParagraphSelect = useCallback(
    (paragraphText: string) => {
      setSelectedText((prev) => {
        if (prev.includes(paragraphText)) {
          // Remove the paragraph if already selected
          return prev.replace(paragraphText, '').replace(/\n\n+/g, '\n\n').trim()
        } else {
          // Add the paragraph
          return prev ? `${prev}\n\n${paragraphText}` : paragraphText
        }
      })
    },
    []
  )

  const handleSelectAll = useCallback(() => {
    const allText = paragraphs.map((p) => p.text).join('\n\n')
    setSelectedText(allText)
  }, [paragraphs])

  const handleDeselectAll = useCallback(() => {
    setSelectedText('')
  }, [])

  const allSelected = useMemo(() => {
    return paragraphs.length > 0 && paragraphs.every((p) => selectedText.includes(p.text))
  }, [paragraphs, selectedText])

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      showCloseButton={true}
      titleIcon={IconLightbulb}
      title={t('editor.modal.summary.title') ?? 'AI Summary'}>
      <Modal.Body>
        <FormGroup className='mb-3'>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <FormLabel className='mb-0'>
              <Trans i18nKey='editor.modal.summary.selectParagraphs' />
            </FormLabel>
            <Button 
              variant='outline-secondary' 
              size='sm' 
              onClick={allSelected ? handleDeselectAll : handleSelectAll}>
              <Trans i18nKey={allSelected ? 'editor.modal.summary.deselectAll' : 'editor.modal.summary.selectAll'} />
            </Button>
          </div>
          <div className='mb-2' style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '0.5rem' }}>
            {paragraphs.map((paragraph) => {
              const isSelected = selectedText.includes(paragraph.text)
              return (
                <div
                  key={paragraph.id}
                  onClick={() => handleParagraphSelect(paragraph.text)}
                  style={{
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#d1ecf1' : 'transparent',
                    borderRadius: '0.25rem',
                    border: isSelected ? '2px solid #0c5460' : '1px solid #dee2e6',
                  }}>
                  {paragraph.text.substring(0, 100)}
                  {paragraph.text.length > 100 ? '...' : ''}
                </div>
              )
            })}
          </div>
        </FormGroup>

        <FormGroup className='mb-3'>
          <FormLabel>
            <Trans i18nKey='editor.modal.summary.selectedText' />
          </FormLabel>
          <FormControl
            as='textarea'
            rows={5}
            value={selectedText}
            onChange={(e) => setSelectedText(e.target.value)}
            placeholder={t('editor.modal.summary.textPlaceholder') ?? 'Enter or select text to summarize'}
          />
        </FormGroup>

        {error && (
          <Alert variant='danger' dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {summary && (
          <FormGroup className='mb-3'>
            <FormLabel>
              <Trans i18nKey='editor.modal.summary.result' />
            </FormLabel>
            <FormControl as='textarea' rows={8} value={summary} readOnly className='bg-light' />
          </FormGroup>
        )}

        {issues && (
          <FormGroup className='mb-3'>
            <FormLabel>
              <Trans i18nKey='editor.modal.summary.issuesResult' />
            </FormLabel>
            <FormControl as='textarea' rows={8} value={issues || ''} readOnly className='bg-light' />
          </FormGroup>
        )}

        <div className='d-flex gap-2 flex-column flex-md-row'>
          <Button onClick={handleGenerateSummary} disabled={isLoading || !selectedText} className='w-100'>
            {isLoading ? (
              <>
                <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' className='me-2' />
                <Trans i18nKey='editor.modal.summary.generating' />
              </>
            ) : (
              <Trans i18nKey='editor.modal.summary.generate' />
            )}
          </Button>
          <Button
            variant='outline-primary'
            onClick={handleCheckForErrors}
            disabled={isChecking || !selectedText}
            className='w-100'>
            {isChecking ? (
              <>
                <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' className='me-2' />
                <Trans i18nKey='editor.modal.summary.checking' />
              </>
            ) : (
              <Trans i18nKey='editor.modal.summary.check' />
            )}
          </Button>
        </div>
      </Modal.Body>
    </CommonModal>
  )
}
