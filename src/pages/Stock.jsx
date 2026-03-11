import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import { getStockStatus } from '../utils/helpers';

export default function Stock() {
    const { stock, products, warehouses } = useApp();
    const [search, setSearch] = useState('');
    const [filterWh, setFilterWh] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const rows = stock
        .map(s => {
            const product = products.find(p => p.id === s.product_id);
            const warehouse = warehouses.find(w => w.id === s.warehouse_id);
            const available = s.on_hand - s.reserved;
            const status = getStockStatus(available, product?.stock_minimo ?? 0);
            return { ...s, product, warehouse, available, status };
        })
        .filter(s => {
            const q = search.toLowerCase();
            const matchSearch = !search ||
                s.product?.sku?.toLowerCase().includes(q) ||
                s.product?.nombre?.toLowerCase().includes(q) ||
                s.warehouse?.nombre?.toLowerCase().includes(q);
            const matchWh = !filterWh || s.warehouse_id === filterWh;
            const matchStatus = !filterStatus || s.status.label === filterStatus;
            return matchSearch && matchWh && matchStatus;
        })
        .sort((a, b) => a.available - b.available);

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Producto, SKU, almacén..." className="flex-1 min-w-[200px]" />
                    <select className="input w-auto" value={filterWh} onChange={e => setFilterWh(e.target.value)}>
                        <option value="">Todos los almacenes</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.nombre}</option>)}
                    </select>
                    <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="OK">OK</option>
                        <option value="Bajo">Bajo</option>
                        <option value="Sin stock">Sin stock</option>
                    </select>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'OK', color: 'emerald', count: stock.filter(s => { const p = products.find(x => x.id === s.product_id); return (s.on_hand - s.reserved) > (p?.stock_minimo ?? 0); }).length },
                    { label: 'Bajo', color: 'amber', count: stock.filter(s => { const p = products.find(x => x.id === s.product_id); const a = s.on_hand - s.reserved; return a > 0 && a <= (p?.stock_minimo ?? 0); }).length },
                    { label: 'Sin stock', color: 'red', count: stock.filter(s => (s.on_hand - s.reserved) <= 0).length },
                ].map(item => (
                    <div key={item.label} className="card text-center">
                        <p className={`text-3xl font-bold mb-1 ${item.color === 'emerald' ? 'text-emerald-600' : item.color === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>{item.count}</p>
                        <p className="text-sm text-gray-500">{item.label}</p>
                    </div>
                ))}
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Producto</th>
                                <th className="table-th">Almacén</th>
                                <th className="table-th text-center">On Hand</th>
                                <th className="table-th text-center">Reservado</th>
                                <th className="table-th text-center">Disponible</th>
                                <th className="table-th text-center">Mínimo</th>
                                <th className="table-th text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr><td colSpan={7} className="py-4">
                                    <EmptyState icon={BarChart3} title="Sin resultados" description="Ajusta los filtros" />
                                </td></tr>
                            ) : rows.map(s => (
                                <tr key={s.id} className="table-row">
                                    <td className="table-td">
                                        <p className="font-medium text-gray-900">{s.product?.nombre ?? '—'}</p>
                                        <p className="text-xs font-mono text-gray-400">{s.product?.sku}</p>
                                    </td>
                                    <td className="table-td text-gray-600">{s.warehouse?.nombre ?? '—'}</td>
                                    <td className="table-td text-center font-semibold text-gray-800">{s.on_hand}</td>
                                    <td className="table-td text-center text-amber-600 font-medium">{s.reserved}</td>
                                    <td className="table-td text-center">
                                        <span className={`font-bold text-lg ${s.status.color === 'red' ? 'text-red-600' : s.status.color === 'yellow' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {s.available}
                                        </span>
                                        <p className="text-xs text-gray-400">{s.product?.uom}</p>
                                    </td>
                                    <td className="table-td text-center text-gray-500">{s.product?.stock_minimo ?? 0}</td>
                                    <td className="table-td text-center">
                                        <Badge label={s.status.label} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
