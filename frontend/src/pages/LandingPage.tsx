import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle, Users, Zap, Shield, ArrowRight, Code2 } from 'lucide-react';
import LoginModal from '../components/auth/LoginModal';

export default function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const containerRef = useRef(null);
  const featuresRef = useRef(null);

  // Smooth scroll setup (Lenis alternative using CSS)
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Hero section scroll animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const features = [
    {
      icon: CheckCircle,
      title: 'Task Management',
      description: 'Organize and track tasks with ease using our intuitive interface',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with real-time updates and notifications',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Zap,
      title: 'Fast & Efficient',
      description: 'Built for speed with modern technologies for optimal performance',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security',
      color: 'from-blue-700 to-cyan-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Code2 className="text-white" size={24} />
              </div>
              <span className="text-xl font-light text-white">TeamCamp <span className="font-thin">Lite</span></span>
            </motion.div>
            
            <motion.button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-light hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section ref={containerRef} className="relative min-h-screen flex items-center justify-center pt-20">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="max-w-5xl mx-auto text-center px-6 z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-light text-white mb-6 tracking-tight">
              Project Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 font-thin mt-2">
                Made Simple
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 font-light mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Streamline your workflow, collaborate with your team, and deliver projects faster with cutting-edge technology
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-light text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
              <ArrowRight size={20} />
            </motion.button>
            <motion.button
              className="px-8 py-4 border-2 border-blue-500/50 text-white rounded-full font-light text-lg hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating Cards */}
        <motion.div
          className="absolute top-1/4 left-12 hidden lg:block"
          style={{
            y: useTransform(scrollYProgress, [0, 1], [0, -100]),
            rotate: useTransform(scrollYProgress, [0, 1], [0, -10])
          }}
        >
          <div className="w-48 h-64 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-cyan-500/30 p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-white/20 rounded w-3/4"></div>
              <div className="h-3 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-12 hidden lg:block"
          style={{
            y: useTransform(scrollYProgress, [0, 1], [0, -150]),
            rotate: useTransform(scrollYProgress, [0, 1], [0, 10])
          }}
        >
          <div className="w-48 h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-500/30 p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-white/20 rounded w-3/4"></div>
              <div className="h-3 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section with Staggered Animation */}
      <section ref={featuresRef} className="relative py-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
              Everything you need
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-thin">
                to succeed
              </span>
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
              Powerful features designed to help teams collaborate and deliver exceptional results
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="relative group"
              >
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 h-full hover:border-slate-700 transition-all duration-300">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-light text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 font-light leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Hover gradient effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300 pointer-events-none`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-600/10 opacity-50"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
                Ready to transform
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-thin">
                  your workflow?
                </span>
              </h2>
              <p className="text-xl text-gray-300 font-light mb-10 max-w-2xl mx-auto">
                Join thousands of teams already using TeamCamp Lite to manage their projects efficiently
              </p>
              <motion.button
                onClick={() => setShowLoginModal(true)}
                className="px-10 py-5 bg-blue-600 text-white rounded-full font-light text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Free Trial
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 py-12 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 font-light">
              © 2024 TeamCamp Lite. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}