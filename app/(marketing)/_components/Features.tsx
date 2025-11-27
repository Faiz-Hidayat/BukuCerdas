'use client';

import React from 'react';
import { Truck, Library, CreditCard, MessageSquareQuote } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Truck, title: 'Pengiriman Kilat', desc: 'Buku sampai di tangan Anda dengan aman dan cepat ke seluruh Indonesia.' },
  { icon: Library, title: 'Koleksi Lengkap', desc: 'Ribuan judul dari penerbit lokal maupun internasional tersedia.' },
  { icon: CreditCard, title: 'Pembayaran Aman', desc: 'Transaksi mudah dengan berbagai metode pembayaran digital.' },
  { icon: MessageSquareQuote, title: 'Review Jujur', desc: 'Ulasan asli dari komunitas pembaca untuk membantu pilihan Anda.' },
];

const Features: React.FC = () => {
  return (
    <section id="keunggulan" className="py-16 lg:py-24 bg-white/50 border-y border-slate-100/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-6 rounded-2xl bg-white border border-slate-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
