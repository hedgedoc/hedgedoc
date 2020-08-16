import { Moment } from 'moment'
import React from 'react'

export interface TimeFromNowProps {
  time: Moment
}

export const TimeFromNow: React.FC<TimeFromNowProps> = ({ time }) => {
  return (
    <time className={'mx-1'} title={time.format('LLLL')} dateTime={time.format()}>{time.fromNow(true)}</time>
  )
}
