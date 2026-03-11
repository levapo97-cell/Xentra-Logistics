import React from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, ShoppingCart, TrendingUp, TrendingDown, AlertTriangle,
    Package, ArrowRight, Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import KPICard from '../components/KPICard';
import Badge from '../components/Badge';
import { formatCurrency, formatDate, getDocumentTotal, getStockStatus } from '../utils/helpers';

export default function Dashboard() {
    const { salesOffers, purchaseQuotes, businessPartners, products, stock } = useApp();

    // ─── KPI Calculations ───────────────────────────────────────────
    const openOffers = salesOffers.filter(o => ['Borrador', 'Enviada'].includes(o.estado));
    const openQuotes = purchaseQuotes.filter(q => ['Borrador', 'Enviada'].includes(q.estado));

    const totalVentas = salesOffers
        .filter(o => o.estado !== 'Cancelada')
        .reduce((sum, o) => sum + getDocumentTotal(o.lineas, 'sale'), 0);

    const totalCompras = purchaseQuotes
        .filter(q => q.estado !== 'Cancelada')
        .reduce((sum, q) => sum + getDocumentTotal(q.lineas, 'purchase'), 0);

    const stockBajoCount = stock.filter(s => {
        const product = products.find(p => p.id === s.product_id);
        const available = s.on_hand - s.reserved;
        const minimo = product?.stock_minimo ?? 0;
        return available <= minimo;
    }).length;

    // ─── Last documents ─────────────────────────────────────────────
    const lastOffers = [...salesOffers].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);
    const lastQuotes = [...purchaseQuotes].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);

    // ─── Top low stock ───────────────────────────────────────────────
    const lowStockItems = stock
        .map(s => {
            const product = products.find(p => p.id === s.product_id);
            const available = s.on_hand - s.reserved;
            const minimo = product?.stock_minimo ?? 0;
            return { ...s, product, available, minimo };
        })
        .filter(s => s.available <= s.minimo)
        .sort((a, b) => a.available - b.available)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <KPICard
                    title="Ofertas Abiertas"
                    value={openOffers.length}
                    subtitle="Borrador + Enviada"
                    icon={FileText}
                    color="brand"
                />
                <KPICard
                    title="Cotizaciones Abiertas"
                    value={openQuotes.length}
                    subtitle="Borrador + Enviada"
                    icon={ShoppingCart}
                    color="blue"
                />
                <KPICard
                    title="Estimado Ventas"
                    value={formatCurrency(totalVentas)}
                    subtitle="Ofertas no canceladas"
                    icon={TrendingUp}
                    color="emerald"
                />
                <KPICard
                    title="Estimado Compras"
                    value={formatCurrency(totalCompras)}
                    subtitle="Cotizaciones no canceladas"
                    icon={TrendingDown}
                    color="amber"
                />
                <KPICard
                    title="Stock Bajo / Agotado"
                    value={stockBajoCount}
                    subtitle="Ítems bajo mínimo"
                    icon={AlertTriangle}
                    color="red"
                />
            </div>

            {/* Last documents + alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Last Offers */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">Últimas Ofertas</h2>
                        <Link to="/ventas/ofertas" className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1">
                            Ver todas <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {lastOffers.map(offer => {
                            const cliente = businessPartners.find(bp => bp.id === offer.cliente_id);
                            return (
                                <Link key={offer.id} to={`/ventas/ofertas/${offer.id}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors group">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-700">{offer.numero_documento}</p>
                                        <p className="text-xs text-gray-500">{cliente?.nombre_comercial ?? '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge label={offer.estado} />
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                                            <Clock size={10} /> {formatDate(offer.fecha)}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Last Quotes */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">Últimas Cotizaciones</h2>
                        <Link to="/compras/cotizaciones" className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1">
                            Ver todas <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {lastQuotes.map(quote => {
                            const proveedor = businessPartners.find(bp => bp.id === quote.proveedor_id);
                            return (
                                <Link key={quote.id} to={`/compras/cotizaciones/${quote.id}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors group">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-700">{quote.numero_documento}</p>
                                        <p className="text-xs text-gray-500">{proveedor?.nombre_comercial ?? '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge label={quote.estado} />
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                                            <Clock size={10} /> {formatDate(quote.fecha)}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Stock Alerts */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-500" />
                            Alertas de Stock
                        </h2>
                        <Link to="/inventario/stock" className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1">
                            Ver stock <ArrowRight size={12} />
                        </Link>
                    </div>
                    {lowStockItems.length === 0 ? (
                        <div className="text-center py-8">
                            <Package size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400">Todo el stock está en niveles óptimos</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lowStockItems.map(item => {
                                const status = getStockStatus(item.available, item.minimo);
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{item.product?.nombre}</p>
                                            <p className="text-xs text-gray-500">{item.product?.sku}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <p className={`text-sm font-bold ${status.color === 'red' ? 'text-red-600' : 'text-amber-600'}`}>
                                                {item.available} {item.product?.uom}
                                            </p>
                                            <p className="text-xs text-gray-400">Mín: {item.minimo}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
