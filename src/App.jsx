import { createContext, useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { setUser, clearUser } from './store/userSlice'
import { getIcon } from './utils/iconUtils'

// Pages
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Callback from './pages/Callback'
import ErrorPage from './pages/ErrorPage'

// Create auth context
export const AuthContext = createContext(null)

const GlassesIcon = getIcon('glasses');

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isInitialized, setIsInitialized] = useState(false)

  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user)
  const isAuthenticated = userState?.isAuthenticated || false

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true)
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search
        let redirectPath = new URLSearchParams(window.location.search).get('redirect')
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
          '/callback') || currentPath.includes('/error')
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath)
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath)
            } else {
              navigate('/')
            }
          } else {
            navigate('/')
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))))
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                  ? `/login?redirect=${currentPath}`
                  : '/login')
          } else if (redirectPath) {
            if (
              ![
                'error',
                'signup',
                'login',
                'callback'
              ].some((path) => currentPath.includes(path)))
              navigate(`/login?redirect=${redirectPath}`)
            else {
              navigate(currentPath)
            }
          } else if (isAuthPage) {
            navigate(currentPath)
          } else {
            navigate('/login')
          }
          dispatch(clearUser())
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error)
      }
    })
  }, [])

  // Check for user's preferred color scheme
  useEffect(() => {
    if (localStorage.theme === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
    setIsDarkMode(!isDarkMode);
  };

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK
        await ApperUI.logout()
        dispatch(clearUser())
        navigate('/login')
      } catch (error) {
        console.error("Logout failed:", error)
      }
    }
  }

  // Header component
  function Header() {
    const MoonIcon = getIcon('moon');
    const SunIcon = getIcon('sun');
    const MenuIcon = getIcon('menu');
    const ShoppingCartIcon = getIcon('shopping-cart');
    const SearchIcon = getIcon('search');
    const HeartIcon = getIcon('heart');
    const UserIcon = getIcon('user')
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <GlassesIcon className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold tracking-tight">OpticalHub5</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="font-medium text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors">Eyeglasses</a>
              <a href="#" className="font-medium text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors">Sunglasses</a>
              <a href="#" className="font-medium text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors">Contact Lenses</a>
              <a href="#" className="font-medium text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors">Virtual Try-On</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              
              <button 
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Favorites"
              >
                <HeartIcon className="w-5 h-5" />
              </button>
              
              <button 
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCartIcon className="w-5 h-5" />
              </button>
              
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              
              <button 
                className="md:hidden p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                <MenuIcon className="w-5 h-5" />
              </button>

              {/* User Authentication Button */}
              {isAuthenticated ? (
                <button 
                  onClick={authMethods.logout}
                  className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  aria-label="Logout"
                >
                  <UserIcon className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 md:hidden overflow-hidden"
              >
                <nav className="flex flex-col space-y-4 py-4">
                  <a href="#" className="font-medium text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors">Eyeglasses</a>
                  <a href="#" className="font-medium text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors">Sunglasses</a>
                  <a href="#" className="font-medium text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors">Contact Lenses</a>
                  <a href="#" className="font-medium text-surface-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors">Virtual Try-On</a>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    );
  }

  // Footer component
  function Footer() {
    const FacebookIcon = getIcon('facebook');
    const InstagramIcon = getIcon('instagram');
    const TwitterIcon = getIcon('twitter');
    const YoutubeIcon = getIcon('youtube');
    
    return (
      <footer className="bg-surface-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GlassesIcon className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold tracking-tight">OpticalHub5</span>
              </div>
              <p className="text-surface-300 mb-4">Your one-stop destination for premium eyewear with cutting-edge virtual try-on technology.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-surface-400 hover:text-white transition-colors">
                  <FacebookIcon className="w-5 h-5" />
                </a>
                <a href="#" className="text-surface-400 hover:text-white transition-colors">
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a href="#" className="text-surface-400 hover:text-white transition-colors">
                  <TwitterIcon className="w-5 h-5" />
                </a>
                <a href="#" className="text-surface-400 hover:text-white transition-colors">
                  <YoutubeIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4 text-white">Products</h5>
              <ul className="space-y-3">
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Eyeglasses</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Sunglasses</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Contact Lenses</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Reading Glasses</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Computer Glasses</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4 text-white">Help & Support</h5>
              <ul className="space-y-3">
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Delivery Information</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Prescription Help</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4 text-white">Company</h5>
              <ul className="space-y-3">
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="text-surface-300 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-surface-700 mt-12 pt-8 text-center text-surface-400">
          <p>© {new Date().getFullYear()} OpticalHub5. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }

  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="loading">Initializing application...</div>
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen flex flex-col">
        {!location.pathname.includes('/login') && 
         !location.pathname.includes('/signup') && 
         !location.pathname.includes('/callback') && 
         !location.pathname.includes('/error') && <Header />}
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>
        
        {!location.pathname.includes('/login') && 
         !location.pathname.includes('/signup') && 
         !location.pathname.includes('/callback') && 
         !location.pathname.includes('/error') && <Footer />}
        
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={isDarkMode ? "dark" : "light"}
          toastClassName="rounded-lg"
        />
      </div>
    </AuthContext.Provider>
  );
}

export default App;