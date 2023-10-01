/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'

/**
 * Provides a factory function for jest.mock to mock a React functional component.
 * The component will be rendered as a span with a data-mock-component attribute
 * containing the name of the component as well as all props and children passed to it.
 *
 * @param name The name of the component to mock.
 * @return An object that contains the mocked component.
 */
export const mockComponent = (name: string) => ({
  // eslint-disable-next-line react/display-name
  [name]: ({ children, ...props }: React.PropsWithChildren) => (
    <span data-mock-component={name} {...props}>
      {children}
    </span>
  )
})
