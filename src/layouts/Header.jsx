import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Moon, Bell, Menu } from 'lucide-react';

export default function Header({ onToggleSidebar, pageTitle }) {
    const { logout } = useApp();

    return (
        <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-30 shrink-0">
            {/* Left: hamburger + title */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{pageTitle}</h1>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

                <div className="hidden sm:flex items-center gap-2">
                    <div className="text-right leading-tight">
                        <p className="text-sm font-medium text-slate-900">Administrador</p>
                        <p className="text-xs text-slate-500">admin@xentra.com</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                    title="Cerrar Sesión"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
