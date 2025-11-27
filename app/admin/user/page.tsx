'use client';

import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon, Shield, ShieldOff, CheckCircle, XCircle, Mail, Calendar, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  idUser: number;
  namaLengkap: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  fotoProfilUrl: string | null;
  tanggalDaftar: string;
  statusAkun: 'aktif' | 'nonaktif' | 'suspended';
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/user');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
    if (!confirm(`Ubah status user menjadi ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/admin/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusAkun: newStatus }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        alert('Gagal mengubah status user');
      }
    } catch (error) {
      console.error('Error updating user status', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-indigo-600">
            Data Pengguna
          </h2>
          <p className="text-slate-500 mt-1">Kelola pengguna terdaftar (Admin & User).</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Tanggal Daftar</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="wait">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p>Memuat data pengguna...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <motion.tr 
                      key={user.idUser}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full overflow-hidden relative shrink-0 shadow-inner ring-2 ring-white">
                            {user.fotoProfilUrl ? (
                              <Image 
                                src={user.fotoProfilUrl} 
                                alt={user.namaLengkap} 
                                fill 
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                                <UserIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                              {user.namaLengkap}
                            </p>
                            <p className="text-xs text-slate-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          user.role === 'admin' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {user.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(user.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          user.statusAkun === 'aktif' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.statusAkun === 'aktif' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} />
                          {user.statusAkun.charAt(0).toUpperCase() + user.statusAkun.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleStatusChange(user.idUser, user.statusAkun)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                user.statusAkun === 'aktif'
                                  ? 'text-rose-500 hover:bg-rose-50 hover:shadow-sm border border-transparent hover:border-rose-100'
                                  : 'text-emerald-500 hover:bg-emerald-50 hover:shadow-sm border border-transparent hover:border-emerald-100'
                              }`}
                              title={user.statusAkun === 'aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              {user.statusAkun === 'aktif' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-slate-700">Tidak ada pengguna ditemukan</p>
                          <p className="text-sm text-slate-500">Coba kata kunci pencarian lain.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
