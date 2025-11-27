'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../(marketing)/_components/Navbar';
import Footer from '../../../(marketing)/_components/Footer';
import { Upload, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function UploadBuktiPage() {
  const params = useParams();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('buktiPembayaran', file);

      const res = await fetch(`/api/pesanan/${params.id}/bukti-pembayaran`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Bukti pembayaran berhasil diupload');
        router.push(`/pesanan-saya/${params.id}`);
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal mengupload bukti pembayaran');
      }
    } catch (error) {
      console.error('Error uploading proof', error);
      alert('Terjadi kesalahan saat upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Upload Bukti Pembayaran</h1>
          <p className="text-slate-600 mt-2">
            Silakan upload foto bukti transfer atau pembayaran Anda untuk pesanan ini.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="relative h-64 w-full">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                    <p className="text-white font-medium">Ganti Foto</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="font-medium text-slate-900 mb-1">Klik atau tarik foto ke sini</p>
                  <p className="text-sm text-slate-500">Format: JPG, PNG. Maks 5MB.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!file || uploading}
                className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Bukti
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
