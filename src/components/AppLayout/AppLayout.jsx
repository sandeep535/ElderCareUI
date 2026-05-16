import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import { PageTitleProvider, usePageTitle } from '../../context/PageTitleContext'
import './AppLayout.css'

function LayoutInner() {
  const { pageTitle } = usePageTitle()
  const [sidebarOpen,      setSidebarOpen]      = useState(false)   // mobile overlay
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)   // desktop collapse

  return (
    <div className={`app-layout${sidebarOpen ? ' sidebar-open' : ''}${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className="app-sidebar">
        <Sidebar collapsed={sidebarCollapsed} onClose={() => setSidebarOpen(false)} />
      </aside>

      <div className="app-main">
        <div className="app-header">
          <Header
            title={pageTitle.title}
            subtitle={pageTitle.subtitle}
            showBack={pageTitle.showBack}
            onMenuClick={() => {
              // mobile: toggle overlay; desktop: toggle collapse
              if (window.innerWidth <= 767) setSidebarOpen(o => !o)
              else setSidebarCollapsed(o => !o)
            }}
          />
        </div>
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default function AppLayout() {
  return (
    <PageTitleProvider>
      <LayoutInner />
    </PageTitleProvider>
  )
}
