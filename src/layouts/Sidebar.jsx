import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Package, Warehouse, BarChart3,
    ArrowRightLeft, ShoppingCart, FileText, ChevronDown, ChevronRight,
    Zap, Banknote, Landmark, Wallet, Settings, ShieldCheck, Hash,
    Building2, Tags, Tag, GitBranch, BookOpen, ClipboardList, Receipt,
    ShoppingBag, FileCheck, X
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Socios de Negocio', icon: Users, path: '/socios' },
    {
        label: 'Inventario', icon: Package,
        children: [
            { label: 'Productos', path: '/inventario/productos', icon: Package },
            { label: 'Almacenes', path: '/inventario/almacenes', icon: Warehouse },
            { label: 'Stock', path: '/inventario/stock', icon: BarChart3 },
            { label: 'Movimientos', path: '/inventario/movimientos', icon: ArrowRightLeft },
        ],
    },
    {
        label: 'Ventas', icon: ShoppingCart,
        children: [
            { label: 'Ofertas de Venta', path: '/ventas/ofertas', icon: FileText },
            { label: 'Órdenes de Venta', path: '/ventas/ordenes', icon: ClipboardList },
            { label: 'Facturas Cliente', path: '/ventas/facturas', icon: Receipt },
        ],
    },
    {
        label: 'Compras', icon: ShoppingBag,
        children: [
            { label: 'Cotizaciones', path: '/compras/cotizaciones', icon: FileText },
            { label: 'Órdenes de Compra', path: '/compras/ordenes', icon: ClipboardList },
            { label: 'Facturas Proveedor', path: '/compras/facturas', icon: FileCheck },
        ],
    },
    {
        label: 'Finanzas', icon: Landmark,
        children: [
            { label: 'Plan de Cuentas', path: '/finanzas/plan-cuentas', icon: BookOpen },
            { label: 'Pagos', path: '/finanzas/pagos', icon: Banknote },
            { label: 'Reportes', path: '/finanzas/reportes', icon: BarChart3 },
        ],
    },
    {
        label: 'Gastos', icon: Wallet,
        children: [
            { label: 'Gastos', path: '/gastos/listado', icon: Wallet },
            { label: 'Departamentos', path: '/gastos/departamentos', icon: Building2 },
            { label: 'Categorías', path: '/gastos/categorias', icon: Tags },
            { label: 'Subcategorías', path: '/gastos/subcategorias', icon: Tag },
            { label: 'Divisiones', path: '/gastos/divisiones', icon: GitBranch },
        ],
    },
    {
        label: 'Configuración', icon: Settings,
        children: [
            { label: 'Permisos', path: '/configuracion/permisos', icon: ShieldCheck },
            { label: 'Rangos Numeración', path: '/configuracion/rangos', icon: Hash },
        ],
    },
];

function NavGroup({ item, collapsed, onClose }) {
    const location = useLocation();
    const isActive = item.children?.some(c => location.pathname.startsWith(c.path));
    const [open, setOpen] = useState(isActive);

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    if (!item.children) {
        return (
            <NavLink
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                }
            >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
        );
    }

    return (
        <div>
            <button
                onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && (
                    <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </>
                )}
            </button>

            {open && !collapsed && (
                <div className="mt-1 ml-4 pl-3 border-l border-gray-200 space-y-0.5">
                    {item.children.map(child => (
                        <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                    ? 'text-brand-700 bg-brand-50 font-semibold'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                                }`
                            }
                        >
                            <child.icon size={15} className="shrink-0" />
                            <span className="truncate">{child.label}</span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Sidebar({ collapsed, onClose, isMobile }) {
    return (
        <aside className={`
            ${isMobile
                ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl'
                : `${collapsed ? 'w-16' : 'w-64'} relative`
            }
            transition-all duration-300 h-screen bg-white border-r border-gray-100 flex flex-col
        `}>
            {/* Logo */}
            <div className="px-4 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-md shrink-0">
                        <Zap size={16} className="text-white" />
                    </div>
                    {(!collapsed || isMobile) && (
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 leading-tight">Xentra</p>
                            <p className="text-xs text-gray-400">Logistics ERP</p>
                        </div>
                    )}
                    {isMobile && (
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item, i) => (
                    <NavGroup key={i} item={item} collapsed={collapsed && !isMobile} onClose={isMobile ? onClose : null} />
                ))}
            </nav>

            {/* Footer */}
            {(!collapsed || isMobile) && (
                <div className="px-4 py-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">v1.0.0 – Mock Data</p>
                </div>
            )}
        </aside>
    );
}
