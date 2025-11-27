"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Library, Book, Users, ShoppingBag, FileText, Settings, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/kategori-buku", label: "Kategori Buku", icon: Library },
    { href: "/admin/buku", label: "Data Buku", icon: Book },
    { href: "/admin/user", label: "User", icon: Users },
    { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingBag },
    { href: "/admin/laporan", label: "Laporan", icon: FileText },
    { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col z-30 shadow-2xl">
            <div className="p-8 border-b border-slate-800">
                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 group">
                    <div className="bg-amber-500 text-slate-900 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/20">
                        <Book className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">BukuCerdas</h1>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">ADMIN PANEL</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative block">
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl shadow-lg shadow-amber-500/20"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div
                                className={`relative flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
                                    isActive ? "text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                }`}>
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <button
                    onClick={async () => {
                        try {
                            await fetch("/api/auth/logout", { method: "POST" });
                            window.location.href = "/login";
                        } catch (error) {
                            console.error("Logout failed", error);
                        }
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group">
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Keluar
                </button>
            </div>
        </aside>
    );
}
