import { Moment } from 'moment'
import React from 'react'

export interface ItalicTime {
  time: Moment
}

export const TimeFromNow: React.FC<ItalicTime> = ({ time }) => {
  return (
    <time className={'mx-1'} title={time.format('LLLL')} dateTime={time.format()}>{time.fromNow(true)}</time>
  )
}
