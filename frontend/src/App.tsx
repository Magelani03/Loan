import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Profile from './pages/Profile'
import LoanStatus from './pages/LoanStatus'
import LoanTypes from './pages/LoanTypes'
import History from './pages/History'
import AccountDetails from './pages/AccountDetails'
import EditProfile from './pages/EditProfile'
import Apply from './pages/Apply'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { Toaster } from './components/ui/toaster'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/loan-status" element={<LoanStatus />} />
        <Route path="/loan-types" element={<LoanTypes />} />
        <Route path="/history" element={<History />} />
        <Route path="/account-details" element={<AccountDetails />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
      <Toaster />
    </>
  )
}
