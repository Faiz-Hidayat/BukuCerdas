import React from 'react';
import { Metadata } from 'next';
import Sidebar from './_components/Sidebar';
import Topbar from './_components/Topbar';
import AdminClientWrapper from './_components/AdminClientWrapper';

export const metadata: Metadata = {
  title: 'BukuCerdas Admin | Dashboard',
  description: 'Pengelolaan data Toko BukuCerdas',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminClientWrapper>
      <div className="min-h-[100vh] bg-slate-50 print:bg-white print:min-h-0 flex flex-col md:flex-row print:block print:w-full print:h-auto print:overflow-visible">
        <Sidebar />
        <div className="flex-1 min-w-0 transition-[margin,padding] duration-300 md:ml-72 print:ml-0 print:md:ml-0 print:flex-none print:w-full print:h-auto print:block print:overflow-visible">
          <Topbar />
          <main className="px-4 py-8 pt-28 md:px-8 md:py-8 md:pt-28 max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none print:block print:w-full print:h-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminClientWrapper>
  );
}
