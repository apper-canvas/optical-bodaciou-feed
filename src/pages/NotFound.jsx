import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

function NotFound() {
  const GlassesOffIcon = getIcon('glasses-off');
  const HomeIcon = getIcon('home');
  const ArrowLeftIcon = getIcon('arrow-left');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          delay: 0.1
        }}
        className="text-primary mb-6"
      >
        <GlassesOffIcon className="w-24 h-24 md:w-32 md:h-32" />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold mb-4 text-center"
      >
        404 - Page Not Found
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg md:text-xl text-surface-600 dark:text-surface-400 mb-8 text-center max-w-md"
      >
        Oops! We can't seem to find the page you're looking for.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link to="/" className="btn-primary">
          <HomeIcon className="w-5 h-5 mr-2" />
          Return Home
        </Link>
        
        <button 
          onClick={() => window.history.back()} 
          className="btn-outline"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Go Back
        </button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 p-6 rounded-lg bg-surface-100 dark:bg-surface-800 max-w-md text-center"
      >
        <h3 className="font-medium mb-2">Looking for something specific?</h3>
        <p className="text-surface-600 dark:text-surface-400 mb-4">
          Try exploring our popular categories or use the search at the top of the page.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/" className="px-3 py-1 bg-surface-200 dark:bg-surface-700 rounded-full text-sm hover:bg-primary hover:text-white transition-colors">
            Eyeglasses
          </Link>
          <Link to="/" className="px-3 py-1 bg-surface-200 dark:bg-surface-700 rounded-full text-sm hover:bg-primary hover:text-white transition-colors">
            Sunglasses
          </Link>
          <Link to="/" className="px-3 py-1 bg-surface-200 dark:bg-surface-700 rounded-full text-sm hover:bg-primary hover:text-white transition-colors">
            Contact Lenses
          </Link>
          <Link to="/" className="px-3 py-1 bg-surface-200 dark:bg-surface-700 rounded-full text-sm hover:bg-primary hover:text-white transition-colors">
            Virtual Try-On
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default NotFound;