import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './shared/stores/userStore'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
