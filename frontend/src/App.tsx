import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import { ToastContainer } from './components/ui/Toast'

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </>
  )
}

export default App
