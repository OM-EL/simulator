import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../utils/auth'

const Header = () => {
  const { isAuthenticated, logout } = useAuthStore()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <header className="bg-white shadow-md">
      <div className="main-container flex justify-between items-center py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full revolut-gradient flex items-center justify-center">
            <span className="text-white font-bold text-lg">BL</span>
          </div>
          <span className="font-semibold text-xl text-midnight">Bank Loan Simulator</span>
        </Link>
        
        <nav>
          {isAuthenticated && isAdmin ? (
            <div className="flex items-center gap-4">
              <span className="text-charcoal">Admin Panel</span>
              <button 
                onClick={logout}
                className="btn-outline text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              {!isAdmin && (
                <Link to="/admin/login" className="btn-outline text-sm">
                  Admin Login
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header