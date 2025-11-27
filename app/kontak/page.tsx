'use client';

import React, { useState } from 'react';
import Navbar from '../(marketing)/_components/Navbar';
import Footer from '../(marketing)/_components/Footer';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KontakPage() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    subjek: '',
    pesan: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/kontak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ nama: '', email: '', subjek: '', pesan: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert('Gagal mengirim pesan. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    // Ganti dengan nomor WhatsApp admin yang sebenarnya
    const phoneNumber = '6281234567890'; 
    const message = 'Halo Admin BukuCerdas, saya ingin bertanya...';
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Hubungi Kami</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Punya pertanyaan atau butuh bantuan? Tim kami siap membantu Anda.
            Silakan hubungi kami melalui formulir di bawah atau chat langsung via WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Informasi Kontak</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Alamat</p>
                    <p className="text-slate-600 text-sm mt-1">
                      Jl. Pendidikan No. 123<br />
                      Jakarta Selatan, 12345<br />
                      Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-slate-600 text-sm mt-1">support@bukucerdas.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Telepon</p>
                    <p className="text-slate-600 text-sm mt-1">+62 21 1234 5678</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat WhatsApp Admin
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Kirim Pesan</h3>
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Pesan Anda berhasil dikirim! Kami akan segera membalasnya.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      placeholder="Masukkan nama Anda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subjek</label>
                  <input
                    type="text"
                    name="subjek"
                    value={formData.subjek}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    placeholder="Apa yang ingin Anda tanyakan?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pesan</label>
                  <textarea
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none"
                    placeholder="Tulis pesan Anda di sini..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kirim Pesan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
