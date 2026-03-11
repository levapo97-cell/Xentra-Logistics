import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Eye, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import { formatDate, formatCurrency, getDocumentTotal } from '../utils/helpers';

const ESTADOS = ['Borrador', 'Confirmada', 'En Proceso', 'Entregada', 'Cancelada'];

export default function SalesOrders() {
    const { salesOrders, updateSalesOrder, businessPartners } = useApp();
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    const filtered = salesOrders.filter(o => {
        const cliente = businessPartners.find(b => b.id === o.cliente_id);
        const q = search.toLowerCase();
        const matchSearch = !search || o.numero_documento.toLowerCase().includes(q)
            || cliente?.nombre_comercial?.toLowerCase().includes(q);
        const matchEstado = !filterEstado || o.estado === filterEstado;
        return matchSearch && matchEstado;
    }).sort((a, b) => b.numero_documento.localeCompare(a.numero_documento));

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar por número o cliente..." className="flex-1 min-w-[180px]" />
                    <select className="input w-auto" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <Link to="/ventas/ordenes/nueva" className="btn-primary whitespace-nowrap"><Plus size={16} /> Nueva Orden</Link>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Número</th>
                                <th className="table-th hidden sm:table-cell">Fecha</th>
                                <th className="table-th">Cliente</th>
                                <th className="table-th hidden md:table-cell">F. Entrega</th>
                                <th className="table-th hidden lg:table-cell">Oferta Ref.</th>
                                <th className="table-th text-right">Total</th>
                                <th className="table-th text-center">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="py-4">
                                    <EmptyState icon={ClipboardList} title="Sin órdenes de venta" description="Crea tu primera orden de venta" />
                                </td></tr>
                            ) : filtered.map(order => {
                                const cliente = businessPartners.find(b => b.id === order.cliente_id);
                                const total = getDocumentTotal(order.lineas, 'sale');
                                return (
                                    <tr key={order.id} className="table-row">
                                        <td className="table-td">
                                            <span className="font-mono font-semibold text-brand-700">{order.numero_documento}</span>
                                        </td>
                                        <td className="table-td text-gray-500 whitespace-nowrap hidden sm:table-cell">{formatDate(order.fecha)}</td>
                                        <td className="table-td">
                                            <p className="font-medium text-gray-900">{cliente?.nombre_comercial ?? '—'}</p>
                                            <p className="text-xs text-gray-400 hidden sm:block">{cliente?.rtn}</p>
                                        </td>
                                        <td className="table-td text-gray-500 hidden md:table-cell">{formatDate(order.fecha_entrega)}</td>
                                        <td className="table-td text-gray-500 hidden lg:table-cell font-mono text-xs">{order.oferta_ref || '—'}</td>
                                        <td className="table-td text-right font-semibold text-gray-900">{formatCurrency(total)}</td>
                                        <td className="table-td text-center"><Badge label={order.estado} /></td>
                                        <td className="table-td">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/ventas/ordenes/${order.id}`} className="icon-btn" title="Ver / Editar"><Eye size={15} /></Link>
                                                {order.estado !== 'Cancelada' && order.estado !== 'Entregada' && (
                                                    <button onClick={() => updateSalesOrder(order.id, { estado: 'Cancelada' })} className="icon-btn hover:text-red-600" title="Cancelar"><X size={15} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
