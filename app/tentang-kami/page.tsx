'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, HeartHandshake, ShieldCheck, Search, ShoppingCart, Package, Home, MessageCircle } from 'lucide-react';
import Navbar from '../(marketing)/_components/Navbar';
import Footer from '../(marketing)/_components/Footer';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
};

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen">
      {/* Fixed Background Image */}
      <div 
        className="fixed top-0 w-full h-screen -z-10 bg-cover bg-center blur-sm opacity-20"
        style={{
          backgroundImage: 'url("https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a5588f4c-503f-4b4c-8ccf-863b00053969_3840w.jpg")',
          maskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)'
        }}
      />

      <Navbar />

      <main>
        {/* Header & Breadcrumb */}
        <section className="pt-32 pb-12 px-6 md:pt-40 md:pb-16 lg:px-8 text-center max-w-7xl mx-auto">
          <motion.div {...fadeInUp}>
            <div className="flex justify-center items-center gap-2 text-sm text-slate-500 mb-6">
              <Link href="/" className="hover:text-amber-700 transition-colors">
                Beranda
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-900">Tentang Kami</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight mb-6">
              Lebih dari Sekadar <span className="italic text-amber-700">Toko Buku.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
              Kami percaya bahwa satu buku yang tepat dapat mengubah jalan hidup seseorang. Selamat datang di rumah bagi para pencari ilmu.
            </p>
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image Side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-amber-200/20 translate-x-4 translate-y-4 rounded-2xl -z-10 transition-transform group-hover:translate-x-2 group-hover:translate-y-2 duration-500"></div>
              <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80" 
                alt="Reading Corner" 
                className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-lg"
              />
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-6">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Sejak 2020</span>
              </div>
              <h2 className="text-3xl font-semibold text-slate-900 mb-6">Membuka Jendela Dunia untuk Indonesia</h2>
              <div className="space-y-6 text-slate-600 font-light leading-loose text-lg">
                <p>
                  BukuCerdas bermula dari sebuah rak kecil di sudut kamar kos pada tahun 2020. Didorong oleh keresahan akan sulitnya mendapatkan buku berkualitas dengan harga yang masuk akal, kami memutuskan untuk membangun jembatan antara penulis hebat dan pembaca yang haus ilmu.
                </p>
                <p>
                  <strong className="text-slate-800">Misi:</strong> Menjadi katalisator literasi di Indonesia, memastikan setiap orang memiliki akses mudah ke sumber pengetahuan terbaik.
                </p>
                <p>
                  <strong className="text-slate-800">Visi:</strong> Mengurasi bacaan yang bermakna, memberikan pelayanan yang memanusiakan pelanggan, dan membangun komunitas pembaca yang inklusif.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white/60 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">Nilai Yang Kami Pegang</h2>
              <p className="text-slate-500 font-light">Komitmen kami untuk memberikan pengalaman terbaik bagi Anda.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Value 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Kurasi Berkualitas</h3>
                <p className="text-slate-500 leading-relaxed font-light">Kami tidak menjual sembarang buku. Setiap judul telah melalui proses seleksi ketat untuk memastikan isinya berbobot dan bermanfaat.</p>
              </motion.div>

              {/* Value 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-6">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Pelayanan Sahabat</h3>
                <p className="text-slate-500 leading-relaxed font-light">Kami melayani Anda layaknya seorang sahabat merekomendasikan buku. Ramah, responsif, dan solutif jika ada kendala.</p>
              </motion.div>

              {/* Value 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Orisinal & Terjangkau</h3>
                <p className="text-slate-500 leading-relaxed font-light">Kami anti buku bajakan. Semua buku 100% orisinal langsung dari penerbit, namun dengan harga yang tetap bersahabat.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">Bagaimana Kami Bekerja</h2>
            </motion.div>
            
            <div className="relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
              
              <div className="grid md:grid-cols-4 gap-8">
                {/* Step 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 bg-[#FDFBF7] border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-6 group-hover:border-amber-500 group-hover:text-amber-600 transition-colors duration-300">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">Pemilihan</h4>
                  <p className="text-sm text-slate-500 px-4">Tim kurator kami memilih buku terbaik dari berbagai penerbit.</p>
                </motion.div>
                
                {/* Step 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 bg-[#FDFBF7] border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-6 group-hover:border-amber-500 group-hover:text-amber-600 transition-colors duration-300">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">Pemesanan</h4>
                  <p className="text-sm text-slate-500 px-4">Proses checkout mudah melalui website atau WhatsApp.</p>
                </motion.div>

                {/* Step 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 bg-[#FDFBF7] border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-6 group-hover:border-amber-500 group-hover:text-amber-600 transition-colors duration-300">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">Pengemasan</h4>
                  <p className="text-sm text-slate-500 px-4">Buku dibungkus bubble wrap tebal agar aman diperjalanan.</p>
                </motion.div>

                {/* Step 4 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 bg-[#FDFBF7] border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-6 group-hover:border-amber-500 group-hover:text-amber-600 transition-colors duration-300">
                    <Home className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">Sampai</h4>
                  <p className="text-sm text-slate-500 px-4">Buku tiba di tangan Anda, siap untuk dinikmati.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-amber-50/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-semibold text-slate-900 mb-12"
            >
              Tim Di Balik Layar
            </motion.h2>
            
            <div className="flex flex-wrap justify-center gap-10 lg:gap-16">
              {/* Team Member 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 grayscale hover:grayscale-0 transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" 
                    alt="Founder" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-medium text-slate-900">Andi Pratama</h4>
                <span className="text-xs text-amber-700 uppercase tracking-wide mt-1">Founder & Kurator</span>
              </motion.div>

              {/* Team Member 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 grayscale hover:grayscale-0 transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" 
                    alt="Manager" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-medium text-slate-900">Siti Rahma</h4>
                <span className="text-xs text-amber-700 uppercase tracking-wide mt-1">Operasional</span>
              </motion.div>

              {/* Team Member 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 grayscale hover:grayscale-0 transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" 
                    alt="CS" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-medium text-slate-900">Budi Santoso</h4>
                <span className="text-xs text-amber-700 uppercase tracking-wide mt-1">Customer Happiness</span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* WhatsApp CTA */}
        <section className="py-24 px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 tracking-tight">Butuh Rekomendasi Buku?</h2>
              <p className="text-slate-300 text-lg mb-10 max-w-lg mx-auto font-light">
                Jangan ragu untuk menyapa kami. Kami siap membantu mencarikan buku yang paling tepat untuk kebutuhan Anda saat ini.
              </p>
              
              <a 
                href="https://wa.me/6281293922428" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-900/20 group"
              >
                <MessageCircle className="w-6 h-6 fill-current" />
                <span className="text-lg">Chat WhatsApp Admin</span>
              </a>
              <p className="mt-4 text-xs text-slate-500">Fast response: Senin - Sabtu, 09.00 - 17.00 WIB</p>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
