import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { getIcon } from '../utils/iconUtils';
import productService from '../services/ProductService';
import tryOnSessionService from '../services/TryOnSessionService';
import customerService from '../services/CustomerService';

function MainFeature() {
  // Icons
  const CameraIcon = getIcon('camera');
  const ImageIcon = getIcon('image');
  const FaceIcon = getIcon('scan-face');
  const CheckIcon = getIcon('check');
  const RefreshCwIcon = getIcon('refresh-cw');
  const ArrowRightIcon = getIcon('arrow-right');
  const InfoIcon = getIcon('info');
  const XIcon = getIcon('x');
  
  // State for the virtual try-on feature
  const [activeStep, setActiveStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedGlasses, setSelectedGlasses] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [showTips, setShowTips] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isWebcamActive = useRef(false);
  
  // Dynamic glasses options from database
  const [glassesOptions, setGlassesOptions] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Get user information from Redux
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // Load products and customer data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingProducts(true);
      try {
        // Load available products for try-on
        const products = await productService.fetchProducts({ pagingInfo: { limit: 8, offset: 0 } });
        
        // Transform products to include fallback images
        const formattedProducts = products.map((product, index) => ({
          ...product,
          id: product.Id,
          name: product.Name,
          image: product.image || [
            "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          ][index % 4],
          overlay: product.overlay_image || [
            "https://images.burst.shopify.com/photos/brown-framed-glasses.jpg?width=300&format=pjpg&exif=0&iptc=0",
            "https://images.burst.shopify.com/photos/glasses-frame-and-case.jpg?width=300&format=pjpg&exif=0&iptc=0",
            "https://images.burst.shopify.com/photos/black-framed-glasses.jpg?width=300&format=pjpg&exif=0&iptc=0",
            "https://images.burst.shopify.com/photos/glasses-and-reading-book.jpg?width=300&format=pjpg&exif=0&iptc=0"
          ][index % 4]
        }));
        
        setGlassesOptions(formattedProducts);
        
        // If user is authenticated, try to find or create customer record
        if (isAuthenticated && user?.emailAddress) {
          let customer = await customerService.getCustomerByEmail(user.emailAddress);
          
          if (!customer) {
            // Create customer record if it doesn't exist
            customer = await customerService.createCustomer({
              Name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddress,
              email: user.emailAddress,
              profile_image: user.profilePicture || ''
            });
          }
          
          setCurrentCustomer(customer);
        }
      } catch (error) {
        console.error('Error loading try-on data:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]);
  // Simulated face detection
  useEffect(() => {
    if (showTryOn && selectedImage) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        setIsProcessing(false);
        setIsFaceDetected(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showTryOn, selectedImage]);
  
  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setActiveStep(2);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle webcam capture
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        isWebcamActive.current = true;
      }
    } catch (error) {
      toast.error("Unable to access webcam. Please check your permissions.");
      console.error("Webcam error:", error);
    }
  };
  
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      isWebcamActive.current = false;
    }
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageDataURL = canvas.toDataURL('image/png');
      setSelectedImage(imageDataURL);
      
      // Stop webcam
      stopWebcam();
      
      // Move to next step
      setActiveStep(2);
    }
  };
  
  // Start try-on process
  const startTryOn = async () => {
    if (!selectedGlasses) {
      toast.warning("Please select glasses to try on");
      return;
    }
    
    // Save try-on session to database if user is authenticated
    if (isAuthenticated && currentCustomer && selectedImage) {
      try {
        const sessionData = {
          Name: `Try-on session for ${selectedGlasses.name}`,
          customer_image: selectedImage,
          selected_product: selectedGlasses.id,
          customer: currentCustomer.Id,
          status: 'Started',
          is_face_detected: false
        };
        
        const session = await tryOnSessionService.createTryOnSession(sessionData);
        if (session) {
          console.log('Try-on session saved:', session);
        }
      } catch (error) {
        console.error('Error saving try-on session:', error);
        // Continue with try-on even if saving fails
      }
    }
    
    setShowTryOn(true);
  };
  
  // Update try-on session when face is detected
  useEffect(() => {
    const updateSessionWithFaceDetection = async () => {
      if (isFaceDetected && isAuthenticated && currentCustomer) {
        try {
          // Find the most recent session for this customer
          const sessions = await tryOnSessionService.getSessionsByCustomer(currentCustomer.Id);
          if (sessions.length > 0) {
            const latestSession = sessions[0];
            await tryOnSessionService.updateTryOnSession(latestSession.Id, {
              is_face_detected: true,
              status: 'Completed'
            });
          }
        } catch (error) {
          console.error('Error updating try-on session:', error);
        }
      }
    };

    if (isFaceDetected) {
      updateSessionWithFaceDetection();
    }
  }, [isFaceDetected, isAuthenticated, currentCustomer]);

  // Reset the try-on
  const resetTryOn = () => {
    setSelectedImage(null);
    setSelectedGlasses(null);
    setShowTryOn(false);
    setIsFaceDetected(false);
    setActiveStep(1);
    stopWebcam();
  };
  
  // Add to cart
  const addToCart = () => {
    if (!isAuthenticated) {
      toast.warning("Please sign in to add items to your cart");
      return;
    }
    
    // TODO: Implement actual cart functionality
    toast.success(`${selectedGlasses.name} added to your cart!`);
    resetTryOn();
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-surface-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Virtual Try-On <span className="text-primary">Technology</span>
          </h2>
          <p className="text-lg text-surface-600 dark:text-surface-400">
            See how different frames look on your face without leaving home. Our AR technology makes it easy to find your perfect match.
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
          {/* Header with steps */}
          <div className="bg-surface-100 dark:bg-surface-700 p-4 border-b border-surface-200 dark:border-surface-600">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activeStep >= 1 ? 'bg-primary text-white' : 'bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-400'
                  }`}
                >
                  <span>1</span>
                </div>
                <span className={activeStep >= 1 ? 'font-medium' : 'text-surface-500 dark:text-surface-400'}>Upload Photo</span>
              </div>
              
              <div className="hidden sm:block w-12 h-px bg-surface-300 dark:bg-surface-600"></div>
              
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activeStep >= 2 ? 'bg-primary text-white' : 'bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-400'
                  }`}
                >
                  <span>2</span>
                </div>
                <span className={activeStep >= 2 ? 'font-medium' : 'text-surface-500 dark:text-surface-400'}>Select Frames</span>
              </div>
              
              <div className="hidden sm:block w-12 h-px bg-surface-300 dark:bg-surface-600"></div>
              
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activeStep >= 3 ? 'bg-primary text-white' : 'bg-surface-200 dark:bg-surface-600 text-surface-600 dark:text-surface-400'
                  }`}
                >
                  <span>3</span>
                </div>
                <span className={activeStep >= 3 ? 'font-medium' : 'text-surface-500 dark:text-surface-400'}>Try On</span>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Upload Photo */}
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <h3 className="text-xl font-semibold mb-6">Upload Your Photo</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* Webcam option */}
                    <div 
                      className="neu-card flex flex-col items-center cursor-pointer hover:scale-[1.02] transition-transform" 
                      onClick={startWebcam}
                    >
                      {isWebcamActive.current ? (
                        <div className="relative w-full h-60 bg-black rounded-lg overflow-hidden">
                          <video 
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          ></video>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              captureImage();
                            }}
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-white rounded-full p-3"
                          >
                            <CameraIcon className="h-6 w-6" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              stopWebcam();
                            }}
                            className="absolute top-2 right-2 bg-surface-700/80 text-white rounded-full p-1.5"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
                            <CameraIcon className="h-8 w-8" />
                          </div>
                          <h4 className="font-medium mb-2">Use Webcam</h4>
                          <p className="text-sm text-surface-500 dark:text-surface-400 text-center">
                            Take a photo with your device's camera
                          </p>
                        </>
                      )}
                    </div>
                    
                    {/* Upload option */}
                    <div 
                      className="neu-card flex flex-col items-center cursor-pointer hover:scale-[1.02] transition-transform" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                      <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                      <h4 className="font-medium mb-2">Upload Photo</h4>
                      <p className="text-sm text-surface-500 dark:text-surface-400 text-center">
                        Choose a photo from your device
                      </p>
                    </div>
                  </div>
                  
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  
                  <button 
                    className="flex items-center text-primary mt-8"
                    onClick={() => setShowTips(!showTips)}
                  >
                    <InfoIcon className="h-4 w-4 mr-1" />
                    <span>Tips for better results</span>
                  </button>
                  
                  <AnimatePresence>
                    {showTips && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 bg-surface-50 dark:bg-surface-700 rounded-lg p-4 w-full max-w-2xl"
                      >
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <CheckIcon className="h-4 w-4 text-primary mt-0.5 mr-2" />
                            <span>Face the camera directly with a neutral expression</span>
                          </li>
                          <li className="flex items-start">
                            <CheckIcon className="h-4 w-4 text-primary mt-0.5 mr-2" />
                            <span>Ensure good lighting on your face</span>
                          </li>
                          <li className="flex items-start">
                            <CheckIcon className="h-4 w-4 text-primary mt-0.5 mr-2" />
                            <span>Remove any eyewear before taking your photo</span>
                          </li>
                          <li className="flex items-start">
                            <CheckIcon className="h-4 w-4 text-primary mt-0.5 mr-2" />
                            <span>Keep hair away from your face for best results</span>
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              
              {/* Step 2: Select Frames */}
              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image preview */}
                    <div className="md:w-1/3">
                      <h3 className="text-xl font-semibold mb-4">Your Photo</h3>
                      <div className="rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-700">
                        <img 
                          src={selectedImage} 
                          alt="Your uploaded face" 
                          className="w-full object-cover"
                        />
                      </div>
                      <button 
                        onClick={resetTryOn}
                        className="mt-4 text-sm flex items-center text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary transition-colors"
                      >
                        <RefreshCwIcon className="h-4 w-4 mr-1" />
                        Change photo
                      </button>
                    </div>
                    
                    {/* Frame selection */}
                    <div className="md:w-2/3">
                      <h3 className="text-xl font-semibold mb-4">Select Your Frames</h3>
                      {isLoadingProducts ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-surface-600 dark:text-surface-400">Loading products...</p>
                        </div>
                      ) : glassesOptions.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-surface-600 dark:text-surface-400">No products available for try-on at the moment.</p>
                        </div>
                      ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {glassesOptions.map((glasses) => (
                          <div 
                            key={glasses.id}
                            onClick={() => setSelectedGlasses(glasses)}
                            className={`
                              p-3 rounded-lg border-2 cursor-pointer transition-all
                              ${selectedGlasses?.id === glasses.id 
                                ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                                : 'border-surface-200 dark:border-surface-700 hover:border-primary/50'}
                            `}
                          >
                            <div className="flex gap-3">
                              <div className="w-16 h-16 overflow-hidden rounded-md bg-white">
                                <img 
                                  src={glasses.image} 
                                  alt={glasses.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium">{glasses.name}</h4>
                                <p className="text-primary font-medium">${glasses.price}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      )}
                      
                      <div className="mt-6 flex justify-end">
                        <button 
                          onClick={startTryOn}
                          className="btn-primary"
                          disabled={!selectedGlasses}
                        >
                          Try These On
                          <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Step 3: Try On */}
              {showTryOn && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col items-center">
                    <h3 className="text-xl font-semibold mb-6">Virtual Try-On</h3>
                    
                    <div className="w-full max-w-lg relative rounded-xl overflow-hidden">
                      {/* Original image */}
                      <img 
                        src={selectedImage} 
                        alt="Your face" 
                        className="w-full"
                      />
                      
                      {/* Processing overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                          <FaceIcon className="h-12 w-12 text-white animate-pulse mb-4" />
                          <p className="text-white font-medium">Analyzing face structure...</p>
                        </div>
                      )}
                      
                      {/* Glasses overlay (simulated) */}
                      {isFaceDetected && selectedGlasses && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* This would be replaced with actual AR glasses positioning in a real app */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute w-3/5 top-[30%] left-1/2 transform -translate-x-1/2"
                          >
                            <img 
                              src={selectedGlasses.overlay} 
                              alt="Glasses overlay" 
                              className="w-full"
                            />
                          </motion.div>
                        </div>
                      )}
                    </div>
                    
                    {isFaceDetected && (
                      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="bg-surface-100 dark:bg-surface-700 p-4 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-16 h-16 overflow-hidden rounded-md bg-white">
                              <img 
                                src={selectedGlasses.image} 
                                alt={selectedGlasses.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium">{selectedGlasses.name}</h4>
                              <p className="text-primary font-medium">${selectedGlasses.price}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <button 
                              onClick={addToCart}
                              className="btn-primary flex-1"
                            >
                              Add to Cart
                            </button>
                            <button 
                              onClick={() => {
                                setShowTryOn(false);
                                setSelectedGlasses(null);
                                setActiveStep(2);
                              }}
                              className="btn-outline flex-1"
                            >
                              Try Another
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MainFeature;