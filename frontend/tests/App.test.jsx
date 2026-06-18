import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'
import App from '../src/App'

const mockResponses = {
  '/': { message: 'Welcome to Tiny API' },
  '/health': { status: 'Healthy' },
  '/version': { version: '1.0.0' },
  '/info': { app: 'Tiny App', environment: 'dev' }
}

global.fetch = vi.fn((url) => {
  const path = new URL(url).pathname
  const body = mockResponses[path] || {}
  return Promise.resolve({ ok: true, json: () => Promise.resolve(body) })
})

test('renders Tiny App and cards with backend data', async () => {
  render(React.createElement(App))
  expect(screen.getByText('🚀 Tiny App — Pipeline Powered!')).toBeInTheDocument()

  await waitFor(() => expect(screen.getByText('Welcome to Tiny API')).toBeInTheDocument())
  expect(screen.getByText('Healthy')).toBeInTheDocument()
  expect(screen.getByText('1.0.0')).toBeInTheDocument()
  expect(screen.getByText('Tiny App - dev')).toBeInTheDocument()
})
