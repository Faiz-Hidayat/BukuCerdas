import React from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const Testimonials: React.FC = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight mb-6">Apa Kata Mereka?</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Kami bangga dapat melayani ribuan pecinta buku di seluruh Indonesia. Komitmen kami adalah kepuasan membaca Anda.
            </p>
            <div className="flex gap-4">
              <button className="p-3 rounded-full border border-slate-200 hover:bg-white hover:shadow-md transition-all">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
            >
              <Quote className="w-8 h-8 text-amber-200 mb-4 fill-current" />
              <p className="text-slate-600 mb-6 leading-relaxed">"Pengiriman sangat cepat dan packaging aman banget. Buku sampai dalam kondisi sempurna tanpa cacat sedikitpun."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Sarah Wijaya</p>
                  <p className="text-xs text-slate-500">Mahasiswi Sastra</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 sm:translate-y-8"
            >
              <Quote className="w-8 h-8 text-amber-200 mb-4 fill-current" />
              <p className="text-slate-600 mb-6 leading-relaxed">"Suka banget sama pilihan bukunya yang lengkap. Fitur review jujur sangat membantu saya memilih bacaan baru."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Budi Santoso</p>
                  <p className="text-xs text-slate-500">Entrepreneur</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;