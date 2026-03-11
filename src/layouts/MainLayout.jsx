import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/socios': 'Socios de Negocio',
    '/inventario/productos': 'Productos',
    '/inventario/almacenes': 'Almacenes',
    '/inventario/stock': 'Stock por Almacén',
    '/inventario/movimientos': 'Movimientos / Kardex',
    '/ventas/ofertas': 'Ofertas de Venta',
    '/ventas/ofertas/nueva': 'Nueva Oferta de Venta',
    '/ventas/ordenes': 'Órdenes de Venta',
    '/ventas/ordenes/nueva': 'Nueva Orden de Venta',
    '/ventas/facturas': 'Facturas de Cliente',
    '/ventas/facturas/nueva': 'Nueva Factura Cliente',
    '/compras/cotizaciones': 'Cotizaciones de Compra',
    '/compras/cotizaciones/nueva': 'Nueva Cotización de Compra',
    '/compras/ordenes': 'Órdenes de Compra',
    '/compras/ordenes/nueva': 'Nueva Orden de Compra',
    '/compras/facturas': 'Facturas de Proveedor',
    '/compras/facturas/nueva': 'Nueva Factura Proveedor',
    '/finanzas/plan-cuentas': 'Plan de Cuentas',
    '/finanzas/pagos': 'Pagos y Cobros',
    '/finanzas/reportes': 'Reportes Financieros',
    '/gastos/listado': 'Gastos',
    '/gastos/departamentos': 'Departamentos',
    '/gastos/categorias': 'Categorías de Gasto',
    '/gastos/subcategorias': 'Subcategorías de Gasto',
    '/gastos/divisiones': 'Divisiones',
    '/configuracion/permisos': 'Permisos y Roles',
    '/configuracion/rangos': 'Rangos de Numeración',
};

function getTitle(pathname) {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith('/ventas/ofertas/')) return 'Detalle Oferta de Venta';
    if (pathname.startsWith('/ventas/ordenes/')) return 'Detalle Orden de Venta';
    if (pathname.startsWith('/ventas/facturas/')) return 'Detalle Factura Cliente';
    if (pathname.startsWith('/compras/cotizaciones/')) return 'Detalle Cotización de Compra';
    if (pathname.startsWith('/compras/ordenes/')) return 'Detalle Orden de Compra';
    if (pathname.startsWith('/compras/facturas/')) return 'Detalle Factura Proveedor';
    return 'Xentra ERP';
}

export default function MainLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const title = getTitle(location.pathname);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close mobile sidebar on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
                <Sidebar collapsed={sidebarCollapsed} isMobile={false} />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Drawer */}
                    <Sidebar isMobile={true} onClose={() => setMobileOpen(false)} />
                </>
            )}

            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                <Header
                    onToggleSidebar={() => {
                        if (window.innerWidth >= 1024) {
                            setSidebarCollapsed(v => !v);
                        } else {
                            setMobileOpen(v => !v);
                        }
                    }}
                    pageTitle={title}
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
