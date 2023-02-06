/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventEmitter2 } from 'eventemitter2'
import type { PropsWithChildren } from 'react'
import React, { createContext, useContext, useEffect, useMemo } from 'react'

export const eventEmitterContext = createContext<EventEmitter2 | undefined>(undefined)

/**
 * Provides the {@link EventEmitter2 event emitter} from the current {@link eventEmitterContext context}.
 */
export const useExtensionEventEmitter = () => {
  return useContext(eventEmitterContext)
}

/**
 * Creates a new {@link EventEmitter2 event emitter} and provides it as {@link eventEmitterContext context}.
 *
 * @param children The elements that should receive the context value
 */
export const ExtensionEventEmitterProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const eventEmitter = useMemo(() => new EventEmitter2(), [])
  return <eventEmitterContext.Provider value={eventEmitter}>{children}</eventEmitterContext.Provider>
}

/**
 * Registers a handler callback on the current {@link EventEmitter2 event emitter} that is provided in the {@link eventEmitterContext context}.
 *
 * @param eventName The name of the event which should be subscribed
 * @param handler The callback that should be executed. If undefined the event will be unsubscribed.
 */
export const useExtensionEventEmitterHandler = <T,>(
  eventName: string,
  handler: ((values: T) => void) | undefined
): void => {
  const eventEmitter = useExtensionEventEmitter()

  useEffect(() => {
    if (!eventEmitter || !handler) {
      return
    }
    eventEmitter.on(eventName, handler)
    return () => {
      eventEmitter.off(eventName, handler)
    }
  }, [eventEmitter, eventName, handler])
}
