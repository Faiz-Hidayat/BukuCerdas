import React from 'react';
import Navbar from './(marketing)/_components/Navbar';
import Hero from './(marketing)/_components/Hero';
import Features from './(marketing)/_components/Features';
import BookShowcase from './(marketing)/_components/BookShowcase';
import Categories from './(marketing)/_components/Categories';
import BestSellers from './(marketing)/_components/BestSellers';
import Testimonials from './(marketing)/_components/Testimonials';
import Footer from './(marketing)/_components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Fixed Background Image */}
      <div 
        className="fixed top-0 w-full h-screen bg-cover bg-center -z-10 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'url("https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a2dfacfd-093c-4775-bacd-c83e2cfff896_3840w.jpg")',
          maskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)'
        }}
      />
      
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        <BookShowcase />
        <Categories />
        <BestSellers />
        <Testimonials />
        
        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto bg-slate-900 rounded-3xl overflow-hidden relative">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"></path>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"></rect>
              </svg>
            </div>

            <div className="relative z-10 px-6 py-20 lg:px-20 lg:py-24 text-center">
              <h2 className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-6">
                Mulai Petualangan Membaca Anda
              </h2>
              <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
                Daftar sekarang dan dapatkan diskon 20% untuk pembelian pertama Anda. Gratis ongkir ke seluruh Jabodetabek.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-slate-900 px-8 py-4 rounded-full font-semibold hover:bg-amber-50 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                  Daftar Gratis
                </button>
                <button className="px-8 py-4 rounded-full font-semibold text-white border border-slate-600 hover:bg-slate-800 transition-all duration-300">
                  Lihat Promo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
