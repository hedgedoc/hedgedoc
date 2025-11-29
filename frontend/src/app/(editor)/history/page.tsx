'use client'

/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LandingLayout } from '../../../components/landing-layout/landing-layout'
import type { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { Alert, Card, Container, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { getMyNotes } from '../../../api/me'
import type { NoteMetadataInterface } from '@hedgedoc/commons'
import Link from 'next/link'
import { DateTime } from 'luxon'

/**
 * History page showing user's created notes.
 */
const HistoryPage: NextPage = () => {
  const { t } = useTranslation()
  const [notes, setNotes] = useState<NoteMetadataInterface[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyNotes()
      .then((fetchedNotes) => {
        // Sort by most recently updated
        const sortedNotes = fetchedNotes.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        setNotes(sortedNotes)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to load notes')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <LandingLayout>
        <Container className="mt-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your notes...</p>
        </Container>
      </LandingLayout>
    )
  }

  if (error) {
    return (
      <LandingLayout>
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Notes</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Container>
      </LandingLayout>
    )
  }

  return (
    <LandingLayout>
      <Container className="mt-5">
        <h1 className="mb-4">Note History</h1>
        {notes.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>No Notes Yet</Alert.Heading>
            <p>You haven&apos;t created any notes yet.</p>
            <Link href="/new" className="btn btn-primary">
              Create your first note
            </Link>
          </Alert>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notes.map((note, index) => (
              <Link key={`${note.primaryAlias}-${index}`} href={`/n/${note.primaryAlias}`} style={{ textDecoration: 'none' }}>
                <Card className="hover-shadow" style={{ cursor: 'pointer' }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">
                        {note.title || 'Untitled Note'}
                      </Card.Title>
                      <small className="text-muted">
                        {DateTime.fromISO(note.updatedAt).toRelative()}
                      </small>
                    </div>
                    {note.description && (
                      <Card.Text className="text-muted">
                        {note.description}
                      </Card.Text>
                    )}
                    <small className="text-muted">
                      <code>/{note.primaryAlias}</code>
                    </small>
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </LandingLayout>
  )
}

export default HistoryPage
