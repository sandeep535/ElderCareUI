import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import { PageTitleProvider, usePageTitle } from '../../context/PageTitleContext'
import './AppLayout.css'

function LayoutInner() {
  const { pageTitle } = usePageTitle()
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>
      <div className="app-main">
        <div className="app-header">
          <Header
            title={pageTitle.title}
            subtitle={pageTitle.subtitle}
            showBack={pageTitle.showBack}
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
