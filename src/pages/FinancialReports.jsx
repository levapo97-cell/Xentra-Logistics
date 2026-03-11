import React, { useState, useMemo } from 'react';
import { TrendingUp, FilePieChart, BarChart3, Package, Wallet, Printer, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────
const fmt = (n) => `L ${(n || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

function SectionHeader({ children }) {
    return (
        <tr className="bg-brand-700">
            <td colSpan={3} className="px-4 py-2 text-white font-bold text-xs uppercase tracking-wider">{children}</td>
        </tr>
    );
}
function Row({ label, value, sub, bold, indent = 0 }) {
    return (
        <tr className={`border-b border-gray-100 hover:bg-gray-50 ${bold ? 'bg-gray-50' : ''}`}>
            <td className="table-td" style={{ paddingLeft: `${16 + indent * 20}px` }}>
                <span className={bold ? 'font-bold text-gray-900' : 'text-gray-700'}>{label}</span>
                {sub && <p className="text-xs text-gray-400">{sub}</p>}
            </td>
            <td className="table-td text-right font-mono">{value !== undefined ? fmt(value) : ''}</td>
            <td className="table-td text-right w-20"></td>
        </tr>
    );
}
function TotalRow({ label, value, positive }) {
    return (
        <tr className="bg-gray-100 border-t-2 border-brand-300">
            <td className="px-4 py-2 font-bold text-gray-900">{label}</td>
            <td className={`px-4 py-2 text-right font-bold font-mono text-base ${positive !== undefined ? (positive ? 'text-green-700' : 'text-red-600') : 'text-gray-900'}`}>{fmt(value)}</td>
            <td className="px-4 py-2"></td>
        </tr>
    );
}

// ─────────────────────────────────────────────
// REPORTE 1: Estado de Resultados
// ─────────────────────────────────────────────
function IncomeStatement({ salesOffers, purchaseQuotes, expenses, payments }) {
    const data = useMemo(() => {
        const ventas = salesOffers
            .filter(o => o.estado === 'Aprobada' || o.estado === 'Enviada')
            .reduce((sum, o) => {
                return sum + o.lineas.reduce((ls, l) => {
                    const base = l.cantidad * l.precio_unitario;
                    const desc = base * (l.descuento_pct / 100);
                    const imp = (base - desc) * (l.impuesto_pct / 100);
                    return ls + base - desc + imp;
                }, 0);
            }, 0);

        const descuentos = salesOffers
            .filter(o => o.estado === 'Aprobada' || o.estado === 'Enviada')
            .reduce((sum, o) => sum + o.lineas.reduce((ls, l) => ls + (l.cantidad * l.precio_unitario * (l.descuento_pct / 100)), 0), 0);

        const costos = purchaseQuotes
            .filter(q => q.estado === 'Aprobada')
            .reduce((sum, q) => sum + q.lineas.reduce((ls, l) => ls + l.cantidad * l.costo_unitario, 0), 0);

        const gastosOpe = expenses.filter(e => e.status === 'Aprobado').reduce((s, e) => s + (e.amount || 0), 0);

        const ingresos = ventas;
        const utilidadBruta = ingresos - descuentos - costos;
        const utilidadNeta = utilidadBruta - gastosOpe;
        const margenBruto = ingresos > 0 ? (utilidadBruta / ingresos) * 100 : 0;
        const margenNeto = ingresos > 0 ? (utilidadNeta / ingresos) * 100 : 0;

        return { ventas, descuentos, costos, gastosOpe, ingresos, utilidadBruta, utilidadNeta, margenBruto, margenNeto };
    }, [salesOffers, purchaseQuotes, expenses, payments]);

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Ingresos Totales', value: data.ingresos, color: 'text-brand-700', bg: 'bg-brand-50' },
                    { label: 'Utilidad Bruta', value: data.utilidadBruta, color: data.utilidadBruta >= 0 ? 'text-green-700' : 'text-red-600', bg: 'bg-green-50' },
                    { label: 'Margen Bruto', value: null, label2: `${data.margenBruto.toFixed(1)}%`, color: data.margenBruto >= 0 ? 'text-green-700' : 'text-red-600', bg: 'bg-yellow-50' },
                    { label: 'Utilidad Neta', value: data.utilidadNeta, color: data.utilidadNeta >= 0 ? 'text-green-700' : 'text-red-600', bg: 'bg-blue-50' },
                ].map((kpi, i) => (
                    <div key={i} className={`card p-4 ${kpi.bg}`}>
                        <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                        <p className={`text-xl font-bold ${kpi.color}`}>{kpi.label2 || fmt(kpi.value)}</p>
                    </div>
                ))}
            </div>

            <div className="card p-0 overflow-hidden">
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            <th className="table-th">Concepto</th>
                            <th className="table-th text-right">Importe (L)</th>
                            <th className="table-th text-right">% Margen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <SectionHeader>I. Ingresos</SectionHeader>
                        <Row label="Ventas Brutas" value={data.ventas} indent={1} />
                        <Row label="(-) Descuentos y Bonificaciones" value={-data.descuentos} indent={1} />
                        <TotalRow label="Ventas Netas" value={data.ingresos - data.descuentos} />

                        <SectionHeader>II. Costo de Ventas</SectionHeader>
                        <Row label="Costo de Mercancías Vendidas" value={data.costos} indent={1} />
                        <TotalRow label="UTILIDAD BRUTA" value={data.utilidadBruta} positive={data.utilidadBruta >= 0} />

                        <SectionHeader>III. Gastos Operativos</SectionHeader>
                        <Row label="Gastos Aprobados (todos los departamentos)" value={data.gastosOpe} indent={1} />
                        <TotalRow label="UTILIDAD OPERATIVA NETA" value={data.utilidadNeta} positive={data.utilidadNeta >= 0} />
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// REPORTE 2: Gastos por Departamento
// ─────────────────────────────────────────────
function ExpensesByDept({ expenses, departments }) {
    const rows = useMemo(() => {
        const total = expenses.filter(e => e.status === 'Aprobado').reduce((s, e) => s + (e.amount || 0), 0);
        return departments.map(d => {
            const deptExpenses = expenses.filter(e => e.department_id === d.id);
            const approved = deptExpenses.filter(e => e.status === 'Aprobado').reduce((s, e) => s + (e.amount || 0), 0);
            const pending = deptExpenses.filter(e => e.status === 'Pendiente').reduce((s, e) => s + (e.amount || 0), 0);
            const count = deptExpenses.length;
            const pct = total > 0 ? (approved / total) * 100 : 0;
            return { ...d, approved, pending, count, pct };
        }).filter(d => d.count > 0).sort((a, b) => b.approved - a.approved);
    }, [expenses, departments]);

    const grandTotal = rows.reduce((s, r) => s + r.approved, 0);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="card p-4 bg-brand-50">
                    <p className="text-xs text-gray-500 mb-1">Total Gastos Aprobados</p>
                    <p className="text-xl font-bold text-brand-700">{fmt(grandTotal)}</p>
                </div>
                <div className="card p-4 bg-yellow-50">
                    <p className="text-xs text-gray-500 mb-1">Total Gastos Pendientes</p>
                    <p className="text-xl font-bold text-yellow-700">{fmt(rows.reduce((s, r) => s + r.pending, 0))}</p>
                </div>
                <div className="card p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Departamentos con Gastos</p>
                    <p className="text-xl font-bold text-gray-900">{rows.length}</p>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            <th className="table-th">Departamento</th>
                            <th className="table-th text-center">Registros</th>
                            <th className="table-th text-right">Aprobado</th>
                            <th className="table-th text-right">Pendiente</th>
                            <th className="table-th">% del Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(d => (
                            <tr key={d.id} className="table-row">
                                <td className="table-td font-medium">{d.name}</td>
                                <td className="table-td text-center">{d.count}</td>
                                <td className="table-td text-right font-mono text-green-700 font-semibold">{fmt(d.approved)}</td>
                                <td className="table-td text-right font-mono text-yellow-700">{fmt(d.pending)}</td>
                                <td className="table-td min-w-[160px]">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-2.5 rounded-full bg-brand-500" style={{ width: `${d.pct}%` }} />
                                        </div>
                                        <span className="text-xs font-mono text-gray-700 w-10 text-right">{d.pct.toFixed(1)}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100 border-t-2 border-brand-300 font-bold">
                            <td className="px-4 py-2">TOTAL</td>
                            <td className="px-4 py-2 text-center">{rows.reduce((s, r) => s + r.count, 0)}</td>
                            <td className="px-4 py-2 text-right font-mono text-green-700">{fmt(grandTotal)}</td>
                            <td className="px-4 py-2 text-right font-mono text-yellow-700">{fmt(rows.reduce((s, r) => s + r.pending, 0))}</td>
                            <td className="px-4 py-2">100%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// REPORTE 3: Balance de Inventario
// ─────────────────────────────────────────────
function InventoryBalance({ products, stock, warehouses }) {
    const rows = useMemo(() => {
        return products.map(p => {
            const stockItems = stock.filter(s => s.product_id === p.id);
            const totalQty = stockItems.reduce((s, i) => s + (i.on_hand || 0), 0);
            const totalReserved = stockItems.reduce((s, i) => s + (i.reserved || 0), 0);
            const available = totalQty - totalReserved;
            const valorCosto = totalQty * (p.costo_compra || 0);
            const valorVenta = totalQty * (p.precio_venta || 0);
            const status = totalQty <= p.stock_minimo ? 'Bajo Stock' : 'Normal';
            return { ...p, totalQty, totalReserved, available, valorCosto, valorVenta, status };
        }).sort((a, b) => b.valorCosto - a.valorCosto);
    }, [products, stock]);

    const totales = useMemo(() => ({
        qty: rows.reduce((s, r) => s + r.totalQty, 0),
        valorCosto: rows.reduce((s, r) => s + r.valorCosto, 0),
        valorVenta: rows.reduce((s, r) => s + r.valorVenta, 0),
    }), [rows]);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="card p-4 bg-brand-50">
                    <p className="text-xs text-gray-500 mb-1">Valor a Costo (Inventario)</p>
                    <p className="text-xl font-bold text-brand-700">{fmt(totales.valorCosto)}</p>
                </div>
                <div className="card p-4 bg-green-50">
                    <p className="text-xs text-gray-500 mb-1">Valor a Precio de Venta</p>
                    <p className="text-xl font-bold text-green-700">{fmt(totales.valorVenta)}</p>
                </div>
                <div className="card p-4 bg-yellow-50">
                    <p className="text-xs text-gray-500 mb-1">Productos con Bajo Stock</p>
                    <p className="text-xl font-bold text-yellow-700">{rows.filter(r => r.status === 'Bajo Stock').length} de {rows.length}</p>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">SKU</th>
                                <th className="table-th">Producto</th>
                                <th className="table-th text-center">En Stock</th>
                                <th className="table-th text-center">Reservado</th>
                                <th className="table-th text-center">Disponible</th>
                                <th className="table-th text-right">Valor Costo</th>
                                <th className="table-th text-right">Valor Venta</th>
                                <th className="table-th">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(p => (
                                <tr key={p.id} className="table-row">
                                    <td className="table-td font-mono text-xs text-brand-700">{p.sku}</td>
                                    <td className="table-td font-medium">{p.nombre}<p className="text-xs text-gray-400">{p.categoria}</p></td>
                                    <td className="table-td text-center">{p.totalQty} {p.uom}</td>
                                    <td className="table-td text-center text-yellow-700">{p.totalReserved}</td>
                                    <td className="table-td text-center font-bold">{p.available}</td>
                                    <td className="table-td text-right font-mono">{fmt(p.valorCosto)}</td>
                                    <td className="table-td text-right font-mono text-green-700">{fmt(p.valorVenta)}</td>
                                    <td className="table-td">
                                        <span className={`badge ${p.status === 'Bajo Stock' ? 'badge-danger' : 'badge-success'}`}>{p.status}</span>
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-100 border-t-2 border-brand-300 font-bold">
                                <td className="px-4 py-2" colSpan={2}>TOTALES</td>
                                <td className="px-4 py-2 text-center">{totales.qty}</td>
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2 text-right font-mono">{fmt(totales.valorCosto)}</td>
                                <td className="px-4 py-2 text-right font-mono text-green-700">{fmt(totales.valorVenta)}</td>
                                <td className="px-4 py-2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// PAGE PRINCIPAL
// ─────────────────────────────────────────────
const REPORTS = [
    { key: 'resultados', label: 'Estado de Resultados', icon: TrendingUp, description: 'Ingresos, costos y utilidad del período' },
    { key: 'gastos', label: 'Gastos por Departamento', icon: Wallet, description: 'Desglose de gastos aprobados por área' },
    { key: 'inventario', label: 'Balance de Inventario', icon: Package, description: 'Valoración de existencias a costo y precio de venta' },
];

export default function FinancialReports() {
    const { salesOffers, purchaseQuotes, expenses, departments, products, stock, warehouses, payments } = useApp();
    const [active, setActive] = useState('resultados');

    const handleExport = (reportKey) => {
        let wsData = [];
        let filename = 'reporte.xlsx';

        if (reportKey === 'resultados') {
            filename = 'estado_resultados.xlsx';
            const ventas = salesOffers.filter(o => o.estado === 'Aprobada' || o.estado === 'Enviada')
                .reduce((s, o) => s + o.lineas.reduce((ls, l) => { const b = l.cantidad * l.precio_unitario; return ls + (b - b * (l.descuento_pct / 100)); }, 0), 0);
            const costos = purchaseQuotes.filter(q => q.estado === 'Aprobada')
                .reduce((s, q) => s + q.lineas.reduce((ls, l) => ls + l.cantidad * l.costo_unitario, 0), 0);
            const gastosTotales = expenses.filter(e => e.status === 'Aprobado').reduce((s, e) => s + e.amount, 0);
            wsData = [
                ['CONCEPTO', 'IMPORTE (HNL)'],
                ['INGRESOS', ''],
                ['Ventas brutas', ventas],
                ['Utilidad Bruta', ventas - costos],
                ['GASTOS OPERATIVOS', ''],
                ['Gastos aprobados', gastosTotales],
                ['UTILIDAD NETA', ventas - costos - gastosTotales],
            ];
        } else if (reportKey === 'gastos') {
            filename = 'gastos_por_departamento.xlsx';
            wsData = [['DEPARTAMENTO', 'APROBADO (HNL)', 'PENDIENTE (HNL)', '% DEL TOTAL']];
            const total = expenses.reduce((s, e) => s + e.amount, 0);
            departments.forEach(dept => {
                const deptExp = expenses.filter(e => e.department_id === dept.id);
                const aprobado = deptExp.filter(e => e.status === 'Aprobado').reduce((s, e) => s + e.amount, 0);
                const pendiente = deptExp.filter(e => e.status === 'Pendiente').reduce((s, e) => s + e.amount, 0);
                const pct = total > 0 ? (((aprobado + pendiente) / total) * 100).toFixed(1) : '0.0';
                wsData.push([dept.nombre, aprobado, pendiente, `${pct}%`]);
            });
        } else if (reportKey === 'inventario') {
            filename = 'balance_inventario.xlsx';
            wsData = [['SKU', 'PRODUCTO', 'STOCK TOTAL', 'VALOR COSTO (HNL)', 'VALOR VENTA (HNL)']];
            products.filter(p => p.activo).forEach(p => {
                const onHand = stock.filter(s => s.product_id === p.id).reduce((s, x) => s + x.on_hand, 0);
                wsData.push([p.sku, p.nombre, onHand, (onHand * (p.costo_compra || 0)), (onHand * (p.precio_venta || 0))]);
            });
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
        XLSX.writeFile(wb, filename);
    };


    return (
        <div className="space-y-5">
            {/* Selector de reportes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {REPORTS.map(r => (
                    <button
                        key={r.key}
                        onClick={() => setActive(r.key)}
                        className={`card p-5 text-left transition-all hover:shadow-md ${active === r.key ? 'ring-2 ring-brand-500 bg-brand-50' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${active === r.key ? 'bg-brand-600' : 'bg-gray-100'}`}>
                            <r.icon size={20} className={active === r.key ? 'text-white' : 'text-gray-600'} />
                        </div>
                        <h3 className={`font-bold mb-1 ${active === r.key ? 'text-brand-700' : 'text-gray-900'}`}>{r.label}</h3>
                        <p className="text-xs text-gray-500">{r.description}</p>
                    </button>
                ))}
            </div>

            {/* Header del reporte activo */}
            <div className="card p-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{REPORTS.find(r => r.key === active)?.label}</h2>
                    <p className="text-sm text-gray-500">Período: Enero – Marzo 2026</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary flex items-center gap-2" onClick={() => window.print()}>
                        <Printer size={15} /> Imprimir
                    </button>
                    <button className="btn-primary flex items-center gap-2" onClick={() => handleExport(active)}>
                        <Download size={15} /> Exportar Excel
                    </button>
                </div>
            </div>

            {/* Contenido del reporte */}
            {active === 'resultados' && (
                <IncomeStatement salesOffers={salesOffers} purchaseQuotes={purchaseQuotes} expenses={expenses} payments={payments} />
            )}
            {active === 'gastos' && (
                <ExpensesByDept expenses={expenses} departments={departments} />
            )}
            {active === 'inventario' && (
                <InventoryBalance products={products} stock={stock} warehouses={warehouses} />
            )}
        </div>
    );
}
