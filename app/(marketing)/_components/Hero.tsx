'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section id="beranda" className="lg:pt-48 lg:pb-32 overflow-hidden pt-32 pb-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Text Content */}
          <div className="max-w-2xl relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/50 border border-amber-200 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span className="text-xs font-medium text-amber-800 uppercase tracking-wide">Toko Buku Online #1</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-semibold text-slate-900 leading-[1.1] tracking-tight mb-6"
            >
              Temukan Dunia dalam <span className="italic text-amber-700">Setiap Halaman.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg"
            >
              Koleksi buku kurasi terbaik dari fiksi hingga pengembangan diri. Nikmati pengalaman belanja buku yang tenang, cepat, dan terpercaya.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="bg-slate-900 text-white px-8 py-4 rounded-full font-medium hover:bg-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Lihat Katalog
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-full font-medium hover:bg-slate-50 transition-all duration-300 flex items-center justify-center">
                Daftar Sekarang
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex gap-4 text-sm text-slate-500 mt-10 gap-x-4 gap-y-4 items-center"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                   <img key={i} src={`https://picsum.photos/64/64?random=${i}`} className="w-10 h-10 rounded-full border-2 border-[#FDFBF7]" alt="User" />
                ))}
              </div>
              <p>Dipercaya oleh 10.000+ Pembaca</p>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1 }}
            className="relative lg:h-[600px] flex justify-center items-center"
          >
             <div className="absolute inset-0 bg-amber-200/30 blur-3xl rounded-full transform translate-x-10 translate-y-10 opacity-60"></div>
             <div className="relative grid grid-cols-2 gap-4 w-full max-w-md transform rotate-[-6deg] hover:rotate-0 transition-transform duration-700 ease-out cursor-default">
                <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80" className="w-full h-64 object-cover rounded-lg shadow-lg transform translate-y-12" alt="Book" />
                <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80" className="w-full h-64 object-cover rounded-lg shadow-lg" alt="Book" />
                <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80" className="transform w-full h-64 object-cover rounded-lg shadow-lg translate-y-12" alt="Book" />
                <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80" className="w-full h-64 object-cover rounded-lg shadow-lg" alt="Book" />
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
