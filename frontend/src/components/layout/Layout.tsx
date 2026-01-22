import { ReactNode, useEffect } from 'react'
import { useHistoryStore } from '../../stores/historyStore'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarOpen, loadChats } = useHistoryStore()

  useEffect(() => {
    loadChats()
  }, [loadChats])

  return (
    <div className="flex h-full w-full bg-background min-h-screen">
      <Sidebar />
      <main
        className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {children}
      </main>
    </div>
  )
}
