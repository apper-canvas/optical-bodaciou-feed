import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';
import productCategoryService from '../services/ProductCategoryService';
import productService from '../services/ProductService';
import testimonialService from '../services/TestimonialService';

function Home() {
  const CheckIcon = getIcon('check-circle');
  const ArrowRightIcon = getIcon('arrow-right');
  const StarIcon = getIcon('star');
  const ShieldIcon = getIcon('shield');
  const TruckIcon = getIcon('truck');
  const HeartIcon = getIcon('heart');

  // State for dynamic data
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user authentication status
  const { isAuthenticated } = useSelector((state) => state.user);
  
  const features = [
    {
      icon: "camera",
      title: "Virtual Try-On",
      description: "See how frames look on your face with our AR technology"
    },
    {
      icon: "scan-face",
      title: "Face Shape Analysis",
      description: "Get personalized frame recommendations based on your face shape"
    },
    {
      icon: "glasses",
      title: "Frame Customization",
      description: "Choose colors, lenses, and add prescription details"
    }
  ];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load categories and products in parallel
        const [categoriesData, productsData, testimonialsData] = await Promise.all([
          productCategoryService.fetchCategories({ pagingInfo: { limit: 4, offset: 0 } }),
          productService.getTrendingProducts(4),
          testimonialService.getFeaturedTestimonials(3)
        ]);
        
        // Set fallback image URLs for categories without images
        const categoriesWithImages = categoriesData.map((category, index) => ({
          ...category,
          image: category.image || [
            "https://images.unsplash.com/photo-1633621618597-31d9c199adc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1600854964509-6c56f2571f5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1556015048-4d3aa10bdfe1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
          ][index % 4]
        }));
        
        // Set fallback images for products without images
        const productsWithImages = productsData.map((product, index) => ({
          ...product,
          image: product.image || [
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1587170194921-7a936088f193?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
          ][index % 4],
          colors: ["#000000", "#3a3a3c", "#a7c5eb"] // Default colors
        }));
        
        setCategories(categoriesWithImages);
        setTrendingProducts(productsWithImages);
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error('Error loading home page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-surface-600 dark:text-surface-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/5 dark:to-secondary/5 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg"
            >
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-balance">
                Find Your Perfect <span className="text-primary">Eyewear</span> with AR Technology
              </h1>
              <p className="text-lg text-surface-600 dark:text-surface-300 mb-8">
                Try on hundreds of frames virtually, get personalized recommendations based on your face shape, and shop with confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary">
                  Virtual Try-On
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
                <button className="btn-outline">
                  Browse Collection
                </button>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm">Free frame adjustments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm">7-day return policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm">2-year warranty</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1625591341337-13dc6e871cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                alt="Person with glasses using virtual try-on" 
                className="rounded-xl shadow-xl z-10 relative"
              />
              <div className="absolute -right-6 -bottom-6 w-24 h-24 md:w-32 md:h-32 bg-primary rounded-full opacity-30 blur-lg -z-10"></div>
              <div className="absolute -left-6 -top-6 w-20 h-20 md:w-28 md:h-28 bg-secondary rounded-full opacity-20 blur-lg -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-surface-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Categories</h2>
            <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
              Explore our wide selection of eyewear categories, from stylish frames to specialized lenses
            </p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className={`grid gap-6 ${categories.length === 0 ? 'grid-cols-1' : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(categories.length, 4)}`}`}
          >
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-surface-500 dark:text-surface-400">No categories available at the moment.</p>
              </div>
            ) : (
              categories.map((category) => (
              <motion.div 
                key={category.id}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-xl"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.Name || category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-medium">{category.Name || category.name}</h3>
                  <p className="text-white/80 text-sm">{category.product_count || 0} Products</p>
                  <button className="mt-3 text-white font-medium flex items-center text-sm group-hover:text-primary transition-colors">
                    View Collection
                    <ArrowRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Feature Section */}
      <MainFeature />

      {/* Trending Products Section */}
      <section className="py-16 bg-surface-50 dark:bg-surface-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Products</h2>
              <p className="text-surface-600 dark:text-surface-400">
                Discover our most popular and highly-rated frames
              </p>
            </div>
            <button className="btn-outline self-start md:self-auto">
              View All Products
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
          
          <div className={`grid gap-6 ${trendingProducts.length === 0 ? 'grid-cols-1' : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(trendingProducts.length, 4)}`}`}>
            {trendingProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-surface-500 dark:text-surface-400">No products available at the moment.</p>
              </div>
            ) : (
              trendingProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white dark:bg-surface-900 rounded-xl shadow-soft overflow-hidden group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.Name || product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {product.discount_price && (
                    <div className="absolute top-3 left-3 bg-secondary text-white text-sm font-medium py-1 px-2 rounded">
                      SALE
                    </div>
                  )}
                  
                  {product.is_new && (
                    <div className="absolute top-3 left-3 bg-primary text-white text-sm font-medium py-1 px-2 rounded">
                      NEW
                    </div>
                  )}
                  
                  <button 
                    className="absolute top-3 right-3 bg-white/90 dark:bg-surface-800/90 p-2 rounded-full hover:bg-primary hover:text-white transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <HeartIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-surface-500 dark:text-surface-400">Product</span>
                    <div className="flex items-center">
                      <StarIcon className="h-3.5 w-3.5 text-yellow-400" />
                      <span className="ml-1 text-xs font-medium">{product.rating || 5}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-lg mb-2">{product.Name || product.name}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.discount_price ? (
                        <>
                          <span className="font-bold text-primary">${product.discount_price}</span>
                          <span className="text-surface-500 line-through text-sm">${product.price}</span>
                        </>
                      ) : (
                        <span className="font-bold">${product.price}</span>
                      )}
                    </div>
                    
                    {product.colors?.length > 0 && (
                      <div className="flex gap-1">
                        {product.colors.map((color, index) => (
                          <div 
                            key={index}
                            className="w-4 h-4 rounded-full border border-surface-200 dark:border-surface-700"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full btn-primary mt-4 py-2">Add to Cart</button>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-surface-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose OpticalHub</h2>
            <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
              Experience the future of eyewear shopping with our innovative features and commitment to quality
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const FeatureIcon = getIcon(feature.icon);
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="neu-card group"
                >
                  <div className="mb-6 inline-flex p-3 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <FeatureIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-surface-600 dark:text-surface-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 border border-surface-200 dark:border-surface-700 rounded-lg">
              <div className="flex-shrink-0 text-primary">
                <TruckIcon className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-medium">Free Shipping</h4>
                <p className="text-sm text-surface-500 dark:text-surface-400">On all orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border border-surface-200 dark:border-surface-700 rounded-lg">
              <div className="flex-shrink-0 text-primary">
                <ShieldIcon className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-medium">2-Year Warranty</h4>
                <p className="text-sm text-surface-500 dark:text-surface-400">On all frames and lenses</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border border-surface-200 dark:border-surface-700 rounded-lg">
              <div className="flex-shrink-0 text-primary">
                <CheckIcon className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-medium">100% Satisfaction</h4>
                <p className="text-sm text-surface-500 dark:text-surface-400">7-day money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-surface-50 dark:bg-surface-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
              Hear from people who have found their perfect eyewear with OpticalHub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-surface-500 dark:text-surface-400">No testimonials available at the moment.</p>
              </div>
            ) : (
              testimonials.map((testimonial, index) => (
              <div key={testimonial.Id || index} className="glass-card">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating || 5 }, (_, star) => (
                    <StarIcon key={star} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-surface-700 dark:text-surface-300 mb-4">
                  {testimonial.content || "The virtual try-on feature is amazing! I could see exactly how different frames looked on my face without leaving home. Found my perfect pair on the first try!"}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-300 dark:bg-surface-600 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${index + 10}`} alt="Customer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{testimonial.Name || "Verified Customer"}</h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;