import { useState, useCallback, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Checkout from './pages/Checkout'
import LogoIntro from './components/LogoIntro'

// Lazy-load admin pages to keep the main bundle small
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminBoxes = lazy(() => import('./pages/admin/AdminBoxes'))
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'))

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
      <div className="w-8 h-8 border-3 border-[#b0925e] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const [introComplete, setIntroComplete] = useState(false)
  const handleIntroComplete = useCallback(() => setIntroComplete(true), [])

  return (
    <>
      {!introComplete && <LogoIntro onComplete={handleIntroComplete} duration={3.5} />}
      <Routes>
        {/* Customer-facing */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Admin */}
        <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<AdminFallback />}><ProtectedRoute><AdminLayout /></ProtectedRoute></Suspense>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="boxes" element={<AdminBoxes />} />
        </Route>
      </Routes>
    </>
  )
}
