import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import { formatDate, formatCurrency, getDocumentTotal } from '../utils/helpers';

const ESTADOS = ['Borrador', 'Confirmada', 'Recibida Parcial', 'Recibida Total', 'Cancelada'];

export default function PurchaseOrders() {
    const { purchaseOrders, updatePurchaseOrder, businessPartners } = useApp();
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    const filtered = purchaseOrders.filter(o => {
        const prov = businessPartners.find(b => b.id === o.proveedor_id);
        const q = search.toLowerCase();
        const matchSearch = !search || o.numero_documento.toLowerCase().includes(q)
            || prov?.nombre_comercial?.toLowerCase().includes(q);
        const matchEstado = !filterEstado || o.estado === filterEstado;
        return matchSearch && matchEstado;
    }).sort((a, b) => b.numero_documento.localeCompare(a.numero_documento));

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar por número o proveedor..." className="flex-1 min-w-[180px]" />
                    <select className="input w-auto" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <Link to="/compras/ordenes/nueva" className="btn-primary whitespace-nowrap"><Plus size={16} /> Nueva OC</Link>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Número</th>
                                <th className="table-th hidden sm:table-cell">Fecha</th>
                                <th className="table-th">Proveedor</th>
                                <th className="table-th hidden md:table-cell">F. Entrega Esp.</th>
                                <th className="table-th hidden lg:table-cell">Cot. Ref.</th>
                                <th className="table-th text-right">Total</th>
                                <th className="table-th text-center">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="py-4">
                                    <EmptyState icon={ShoppingBag} title="Sin órdenes de compra" description="Crea tu primera orden de compra" />
                                </td></tr>
                            ) : filtered.map(order => {
                                const prov = businessPartners.find(b => b.id === order.proveedor_id);
                                const total = getDocumentTotal(order.lineas, 'purchase');
                                return (
                                    <tr key={order.id} className="table-row">
                                        <td className="table-td font-mono font-semibold text-brand-700">{order.numero_documento}</td>
                                        <td className="table-td text-gray-500 hidden sm:table-cell">{formatDate(order.fecha)}</td>
                                        <td className="table-td">
                                            <p className="font-medium">{prov?.nombre_comercial ?? '—'}</p>
                                            <p className="text-xs text-gray-400 hidden sm:block">{order.moneda}</p>
                                        </td>
                                        <td className="table-td text-gray-500 hidden md:table-cell">{formatDate(order.fecha_entrega_esperada)}</td>
                                        <td className="table-td text-gray-500 hidden lg:table-cell font-mono text-xs">{order.cotizacion_ref || '—'}</td>
                                        <td className="table-td text-right font-semibold">{formatCurrency(total)}</td>
                                        <td className="table-td text-center"><Badge label={order.estado} /></td>
                                        <td className="table-td">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/compras/ordenes/${order.id}`} className="icon-btn" title="Ver"><Eye size={15} /></Link>
                                                {!['Cancelada', 'Recibida Total'].includes(order.estado) && (
                                                    <button onClick={() => updatePurchaseOrder(order.id, { estado: 'Cancelada' })} className="icon-btn hover:text-red-600" title="Cancelar"><X size={15} /></button>
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
