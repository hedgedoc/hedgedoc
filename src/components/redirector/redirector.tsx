import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router'
import { useParams } from 'react-router-dom'
import { getNote } from '../../api/note'
import { NotFound } from '../error/not-found'

interface RouteParameters {
  id: string
}

export const Redirector: React.FC = () => {
  const { id } = useParams<RouteParameters>()
  const [error, setError] = useState<boolean | null>(null)

  useEffect(() => {
    getNote(id)
      .then((noteFromAPI) => setError(!noteFromAPI.preVersionTwoNote))
      .catch(() => setError(true))
  }, [id])

  if (error) {
    return (<NotFound/>)
  } else if (!error && error != null) {
    return (<Redirect to={`/n/${id}`}/>)
  } else {
    return (<span>Loading</span>)
  }
}
