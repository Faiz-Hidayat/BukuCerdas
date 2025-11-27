'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../(marketing)/_components/Navbar';
import Footer from '../(marketing)/_components/Footer';
import { User, MapPin, Camera, Save, Trash2, Plus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserData {
  namaLengkap: string;
  username: string;
  email: string;
  nomorTelepon: string;
  fotoProfilUrl: string | null;
}

interface Address {
  idAlamat: number;
  namaPenerima: string;
  nomorTelepon: string;
  kota: string;
  provinsi: string;
  alamatLengkap: string;
  kodePos: string;
  isDefault: boolean;
}

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState<'profil' | 'alamat'>('profil');
  const [user, setUser] = useState<UserData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<UserData>({
    namaLengkap: '',
    username: '',
    email: '',
    nomorTelepon: '',
    fotoProfilUrl: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    namaPenerima: '',
    nomorTelepon: '',
    kota: '',
    provinsi: '',
    alamatLengkap: '',
    kodePos: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, addrRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/user/alamat'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.data) {
          setUser(userData.data);
          setFormData({
            namaLengkap: userData.data.namaLengkap || '',
            username: userData.data.username || '',
            email: userData.data.email || '',
            nomorTelepon: userData.data.nomorTelepon || '',
            fotoProfilUrl: userData.data.fotoProfilUrl,
          });
        }
      } else if (userRes.status === 401) {
        window.location.href = '/login';
      }

      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData);
      }
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('namaLengkap', formData.namaLengkap);
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('nomorTelepon', formData.nomorTelepon);
      if (selectedFile) {
        data.append('fotoProfil', selectedFile);
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        body: data,
      });

      if (res.ok) {
        alert('Profil berhasil diperbarui');
        window.location.reload();
      } else {
        alert('Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/alamat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses([...addresses, data]);
        setShowAddressForm(false);
        setNewAddress({
            namaPenerima: '',
            nomorTelepon: '',
            kota: '',
            provinsi: '',
            alamatLengkap: '',
            kodePos: '',
            isDefault: false,
        });
        // If default was set, refresh to update others
        if (newAddress.isDefault) fetchData();
      }
    } catch (error) {
      console.error('Error adding address', error);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Hapus alamat ini?')) return;
    try {
      const res = await fetch(`/api/user/alamat/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAddresses(addresses.filter(a => a.idAlamat !== id));
      }
    } catch (error) {
      console.error('Error deleting address', error);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      const res = await fetch(`/api/user/alamat/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        fetchData(); // Refresh to update all statuses
      }
    } catch (error) {
      console.error('Error setting default address', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-40 bg-slate-200 rounded-xl w-full" />
            <div className="h-96 bg-slate-200 rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Profil Saya</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 text-center border-b border-slate-100">
                <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 overflow-hidden">
                  {previewUrl || formData.fotoProfilUrl ? (
                    <img 
                      src={previewUrl || formData.fotoProfilUrl || ''} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                </div>
                <h2 className="font-semibold text-slate-900">{formData.namaLengkap}</h2>
                <p className="text-sm text-slate-500">{formData.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setActiveTab('profil')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'profil' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Edit Profil
                </button>
                <button
                  onClick={() => setActiveTab('alamat')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'alamat' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Daftar Alamat
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
              {activeTab === 'profil' ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Edit Profil</h2>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-slate-100 rounded-full overflow-hidden relative group">
                      {previewUrl || formData.fotoProfilUrl ? (
                        <img 
                          src={previewUrl || formData.fotoProfilUrl || ''} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Foto Profil</p>
                      <p className="text-sm text-slate-500">Format: JPG, PNG. Maks 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={formData.namaLengkap}
                        onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Telepon</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={formData.nomorTelepon}
                        onChange={(e) => setFormData({ ...formData, nomorTelepon: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Menyimpan...' : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Daftar Alamat</h2>
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Alamat
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <form onSubmit={handleAddAddress} className="bg-slate-50 p-6 rounded-xl mb-6">
                      <h3 className="font-semibold text-slate-900 mb-4">Tambah Alamat Baru</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Nama Penerima"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                          value={newAddress.namaPenerima}
                          onChange={(e) => setNewAddress({ ...newAddress, namaPenerima: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Nomor Telepon"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                          value={newAddress.nomorTelepon}
                          onChange={(e) => setNewAddress({ ...newAddress, nomorTelepon: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Kota"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                          value={newAddress.kota}
                          onChange={(e) => setNewAddress({ ...newAddress, kota: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Provinsi"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                          value={newAddress.provinsi}
                          onChange={(e) => setNewAddress({ ...newAddress, provinsi: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Kode Pos"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                          value={newAddress.kodePos}
                          onChange={(e) => setNewAddress({ ...newAddress, kodePos: e.target.value })}
                          required
                        />
                      </div>
                      <textarea
                        placeholder="Alamat Lengkap"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4"
                        rows={3}
                        value={newAddress.alamatLengkap}
                        onChange={(e) => setNewAddress({ ...newAddress, alamatLengkap: e.target.value })}
                        required
                      />
                      <div className="flex items-center gap-2 mb-4">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="isDefault" className="text-sm text-slate-700">Jadikan alamat utama</label>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                        >
                          Simpan Alamat
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div key={addr.idAlamat} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-900">{addr.namaPenerima}</span>
                                {addr.isDefault && (
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Utama</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">{addr.nomorTelepon}</p>
                              <p className="text-sm text-slate-600 mt-1">{addr.alamatLengkap}, {addr.kota}, {addr.provinsi} {addr.kodePos}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(addr.idAlamat)}
                                  className="text-sm text-slate-500 hover:text-amber-600 px-2 py-1"
                                >
                                  Set Utama
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(addr.idAlamat)}
                                className="text-slate-400 hover:text-red-500 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {addresses.length === 0 && (
                        <p className="text-slate-500 text-center py-8">Belum ada alamat tersimpan.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
