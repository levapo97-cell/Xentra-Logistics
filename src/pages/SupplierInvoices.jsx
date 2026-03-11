import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Eye, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import { formatDate, formatCurrency, getDocumentTotal } from '../utils/helpers';

const ESTADOS = ['Pendiente', 'Pagada', 'Vencida', 'Anulada'];

export default function SupplierInvoices() {
    const { supplierInvoices, updateSupplierInvoice, businessPartners } = useApp();
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    const filtered = supplierInvoices.filter(inv => {
        const prov = businessPartners.find(b => b.id === inv.proveedor_id);
        const q = search.toLowerCase();
        const matchSearch = !search || inv.numero_documento.toLowerCase().includes(q)
            || prov?.nombre_comercial?.toLowerCase().includes(q)
            || inv.num_factura_proveedor?.toLowerCase().includes(q);
        const matchEstado = !filterEstado || inv.estado === filterEstado;
        return matchSearch && matchEstado;
    }).sort((a, b) => b.numero_documento.localeCompare(a.numero_documento));

    const totalPendiente = filtered.filter(i => i.estado === 'Pendiente').reduce((s, i) => s + getDocumentTotal(i.lineas, 'purchase'), 0);
    const totalPagado = filtered.filter(i => i.estado === 'Pagada').reduce((s, i) => s + getDocumentTotal(i.lineas, 'purchase'), 0);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 bg-yellow-50"><p className="text-xs text-gray-500">Pendiente de Pago</p><p className="text-lg font-bold text-yellow-700">{formatCurrency(totalPendiente)}</p></div>
                <div className="card p-4 bg-green-50"><p className="text-xs text-gray-500">Total Pagado</p><p className="text-lg font-bold text-green-700">{formatCurrency(totalPagado)}</p></div>
            </div>

            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar por número o proveedor..." className="flex-1 min-w-[180px]" />
                    <select className="input w-auto" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <Link to="/compras/facturas/nueva" className="btn-primary whitespace-nowrap"><Plus size={16} /> Nueva Factura</Link>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">N° Interno</th>
                                <th className="table-th hidden sm:table-cell">N° Proveedor</th>
                                <th className="table-th">Proveedor</th>
                                <th className="table-th hidden md:table-cell">Fecha</th>
                                <th className="table-th hidden md:table-cell">Vencimiento</th>
                                <th className="table-th hidden lg:table-cell">OC Ref.</th>
                                <th className="table-th text-right">Total</th>
                                <th className="table-th text-center">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} className="py-4">
                                    <EmptyState icon={FileCheck} title="Sin facturas de proveedor" description="Registra tu primera factura de proveedor" />
                                </td></tr>
                            ) : filtered.map(inv => {
                                const prov = businessPartners.find(b => b.id === inv.proveedor_id);
                                const total = getDocumentTotal(inv.lineas, 'purchase');
                                return (
                                    <tr key={inv.id} className="table-row">
                                        <td className="table-td font-mono font-semibold text-brand-700">{inv.numero_documento}</td>
                                        <td className="table-td text-gray-500 font-mono text-xs hidden sm:table-cell">{inv.num_factura_proveedor}</td>
                                        <td className="table-td">
                                            <p className="font-medium">{prov?.nombre_comercial ?? '—'}</p>
                                            <p className="text-xs text-gray-400 hidden sm:block">{inv.moneda}</p>
                                        </td>
                                        <td className="table-td text-gray-500 hidden md:table-cell">{formatDate(inv.fecha)}</td>
                                        <td className="table-td text-gray-500 hidden md:table-cell">{formatDate(inv.fecha_vencimiento)}</td>
                                        <td className="table-td text-gray-500 hidden lg:table-cell font-mono text-xs">{inv.orden_ref || '—'}</td>
                                        <td className="table-td text-right font-semibold">{formatCurrency(total)}</td>
                                        <td className="table-td text-center"><Badge label={inv.estado} /></td>
                                        <td className="table-td">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/compras/facturas/${inv.id}`} className="icon-btn" title="Ver"><Eye size={15} /></Link>
                                                {!['Pagada', 'Anulada'].includes(inv.estado) && (
                                                    <button onClick={() => updateSupplierInvoice(inv.id, { estado: 'Anulada' })} className="icon-btn hover:text-red-600" title="Anular"><X size={15} /></button>
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
