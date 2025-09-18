import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navigation } from './Navigation'

export const Layout: React.FC = () => {
  const location = useLocation()
  
  return (
    <>
      <Navigation />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </>
  )
}