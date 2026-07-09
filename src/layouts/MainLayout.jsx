import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import CursorGlow from '../components/lab/CursorGlow.jsx'

function MainLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-background text-white">
      <CursorGlow />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
