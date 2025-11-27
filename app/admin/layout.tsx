import React from "react";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <Topbar />
            <main className="pl-72 pt-20 min-h-screen transition-all duration-300 ease-in-out">
                <div className="p-8 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
