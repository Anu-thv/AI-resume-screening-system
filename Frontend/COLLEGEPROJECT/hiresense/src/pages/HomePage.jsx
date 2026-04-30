import React from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FiZap,
  FiArrowRight,
  FiFileText,
  FiBarChart2,
} from 'react-icons/fi';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-950 text-white min-h-screen overflow-hidden">


      <section className="relative px-6 lg:px-20 pt-12 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-lg mb-8"
          >
            <FiZap className="text-cyan-400" />
            <span className="text-sm text-slate-300">
              AI-Powered Resume Analysis
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-extrabold leading-tight mb-6">
            HireSense
          </h1>

          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-semibold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            AI Resume Screening and Eligibility Prediction System
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 shadow-xl shadow-cyan-500/30 font-semibold flex items-center justify-center gap-2"
              onClick={() => navigate('/login')}
            >
              Get Started
              <FiArrowRight />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 shadow-xl font-semibold flex items-center justify-center gap-2 text-white"
              onClick={() => navigate('/backup')}
            >
              Backup Data
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-24 left-10 hidden lg:block"
        >
          <img 
            src="/hiresense_logo.png" 
            alt="HireSense Floating Logo" 
            className="w-32 h-32 rounded-full opacity-90 shadow-[0_0_40px_rgba(34,211,238,0.8)]"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-24 right-16 hidden lg:block text-purple-400 text-6xl opacity-20"
        >
          <FiBarChart2 />
        </motion.div>
      </section>

    </div>
  );
}

export default HomePage;
