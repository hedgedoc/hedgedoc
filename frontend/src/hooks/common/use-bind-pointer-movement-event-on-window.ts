/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react'

/**
 * Registers event listener for pointer movement and pointer release on the window object.
 *
 * @param onPointerMovement is triggered if the user moves the pointer over the window
 * @param onPointerRelease is triggered if the pointer is released (touch end or mouse up)
 */
export const useBindPointerMovementEventOnWindow = (
  onPointerMovement: (event: MouseEvent | TouchEvent) => void,
  onPointerRelease: () => void
): void => {
  useEffect(() => {
    const pointerMovement = onPointerMovement
    const pointerRelease = onPointerRelease
    window.addEventListener('touchmove', pointerMovement)
    window.addEventListener('mousemove', pointerMovement)
    window.addEventListener('touchcancel', pointerRelease)
    window.addEventListener('touchend', pointerRelease)
    window.addEventListener('mouseup', pointerRelease)

    return () => {
      window.removeEventListener('touchmove', pointerMovement)
      window.removeEventListener('mousemove', pointerMovement)
      window.removeEventListener('touchcancel', pointerRelease)
      window.removeEventListener('touchend', pointerRelease)
      window.removeEventListener('mouseup', pointerRelease)
    }
  }, [onPointerMovement, onPointerRelease])
}
