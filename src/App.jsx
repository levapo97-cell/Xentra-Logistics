import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import BusinessPartners from './pages/BusinessPartners';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import Stock from './pages/Stock';
import Movements from './pages/Movements';

// Sales
import SalesOffers from './pages/SalesOffers';
import SalesOfferForm from './pages/SalesOfferForm';
import SalesOrders from './pages/SalesOrders';
import SalesOrderForm from './pages/SalesOrderForm';
import CustomerInvoices from './pages/CustomerInvoices';
import CustomerInvoiceForm from './pages/CustomerInvoiceForm';

// Purchases
import PurchaseQuotes from './pages/PurchaseQuotes';
import PurchaseQuoteForm from './pages/PurchaseQuoteForm';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseOrderForm from './pages/PurchaseOrderForm';
import SupplierInvoices from './pages/SupplierInvoices';
import SupplierInvoiceForm from './pages/SupplierInvoiceForm';

// Financial
import ChartOfAccounts from './pages/ChartOfAccounts';
import Payments from './pages/Payments';
import FinancialReports from './pages/FinancialReports';

// Configuration
import Permissions from './pages/Permissions';
import NumberingRanges from './pages/NumberingRanges';

// Expenses
import Expenses from './pages/Expenses';
import Departments from './pages/Departments';
import Categories from './pages/Categories';
import Subcategories from './pages/Subcategories';
import Divisions from './pages/Divisions';

import Login from './pages/Login';
import { useApp } from './context/AppContext';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useApp();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute><MainLayout /></ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="socios" element={<BusinessPartners />} />

                        <Route path="inventario/productos" element={<Products />} />
                        <Route path="inventario/almacenes" element={<Warehouses />} />
                        <Route path="inventario/stock" element={<Stock />} />
                        <Route path="inventario/movimientos" element={<Movements />} />

                        {/* Ventas */}
                        <Route path="ventas/ofertas" element={<SalesOffers />} />
                        <Route path="ventas/ofertas/nueva" element={<SalesOfferForm />} />
                        <Route path="ventas/ofertas/:id" element={<SalesOfferForm />} />
                        <Route path="ventas/ordenes" element={<SalesOrders />} />
                        <Route path="ventas/ordenes/nueva" element={<SalesOrderForm />} />
                        <Route path="ventas/ordenes/:id" element={<SalesOrderForm />} />
                        <Route path="ventas/facturas" element={<CustomerInvoices />} />
                        <Route path="ventas/facturas/nueva" element={<CustomerInvoiceForm />} />
                        <Route path="ventas/facturas/:id" element={<CustomerInvoiceForm />} />

                        {/* Compras */}
                        <Route path="compras/cotizaciones" element={<PurchaseQuotes />} />
                        <Route path="compras/cotizaciones/nueva" element={<PurchaseQuoteForm />} />
                        <Route path="compras/cotizaciones/:id" element={<PurchaseQuoteForm />} />
                        <Route path="compras/ordenes" element={<PurchaseOrders />} />
                        <Route path="compras/ordenes/nueva" element={<PurchaseOrderForm />} />
                        <Route path="compras/ordenes/:id" element={<PurchaseOrderForm />} />
                        <Route path="compras/facturas" element={<SupplierInvoices />} />
                        <Route path="compras/facturas/nueva" element={<SupplierInvoiceForm />} />
                        <Route path="compras/facturas/:id" element={<SupplierInvoiceForm />} />

                        {/* Finanzas */}
                        <Route path="finanzas/plan-cuentas" element={<ChartOfAccounts />} />
                        <Route path="finanzas/pagos" element={<Payments />} />
                        <Route path="finanzas/reportes" element={<FinancialReports />} />

                        {/* Gastos */}
                        <Route path="gastos/listado" element={<Expenses />} />
                        <Route path="gastos/departamentos" element={<Departments />} />
                        <Route path="gastos/categorias" element={<Categories />} />
                        <Route path="gastos/subcategorias" element={<Subcategories />} />
                        <Route path="gastos/divisiones" element={<Divisions />} />

                        {/* Configuración */}
                        <Route path="configuracion/permisos" element={<Permissions />} />
                        <Route path="configuracion/rangos" element={<NumberingRanges />} />

                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}
