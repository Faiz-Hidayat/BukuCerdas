import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Fiksi', img: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=400&q=80' },
  { name: 'Non-Fiksi', img: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg' },
  { name: 'Bisnis', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80' },
  { name: 'Pendidikan', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Seni', img: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg' },
  { name: 'Teknologi', img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80' },
];

const Categories: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight mb-3">Kategori Populer</h2>
            <p className="text-slate-500">Jelajahi buku berdasarkan minat dan kebutuhan Anda.</p>
          </div>
          <a href="#" className="text-sm font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1 group">
            Lihat Semua Kategori
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <motion.a 
              key={index}
              href="#"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-32 rounded-xl overflow-hidden flex items-center justify-center bg-slate-100"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img src={cat.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
              <span className="relative z-20 text-white font-medium tracking-wide">{cat.name}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;