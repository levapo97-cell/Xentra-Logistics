import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Eye, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import { formatDate, formatCurrency, getDocumentTotal } from '../utils/helpers';

const ESTADOS = ['Emitida', 'Pagada', 'Vencida', 'Anulada'];

export default function CustomerInvoices() {
    const { customerInvoices, updateCustomerInvoice, businessPartners } = useApp();
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    const filtered = customerInvoices.filter(inv => {
        const cliente = businessPartners.find(b => b.id === inv.cliente_id);
        const q = search.toLowerCase();
        const matchSearch = !search || inv.numero_documento.toLowerCase().includes(q)
            || cliente?.nombre_comercial?.toLowerCase().includes(q);
        const matchEstado = !filterEstado || inv.estado === filterEstado;
        return matchSearch && matchEstado;
    }).sort((a, b) => b.numero_documento.localeCompare(a.numero_documento));

    const totalEmitido = filtered.filter(i => i.estado !== 'Anulada').reduce((s, i) => s + getDocumentTotal(i.lineas, 'sale'), 0);
    const totalPagado = filtered.filter(i => i.estado === 'Pagada').reduce((s, i) => s + getDocumentTotal(i.lineas, 'sale'), 0);

    return (
        <div className="space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="card p-4 bg-brand-50"><p className="text-xs text-gray-500">Total Facturado</p><p className="text-lg font-bold text-brand-700">{formatCurrency(totalEmitido)}</p></div>
                <div className="card p-4 bg-green-50"><p className="text-xs text-gray-500">Total Cobrado</p><p className="text-lg font-bold text-green-700">{formatCurrency(totalPagado)}</p></div>
                <div className="card p-4 bg-red-50 col-span-2 sm:col-span-1"><p className="text-xs text-gray-500">Por Cobrar</p><p className="text-lg font-bold text-red-600">{formatCurrency(totalEmitido - totalPagado)}</p></div>
            </div>

            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar por número o cliente..." className="flex-1 min-w-[180px]" />
                    <select className="input w-auto" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <Link to="/ventas/facturas/nueva" className="btn-primary whitespace-nowrap"><Plus size={16} /> Nueva Factura</Link>
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
                                <th className="table-th hidden md:table-cell">Vencimiento</th>
                                <th className="table-th hidden lg:table-cell">Orden Ref.</th>
                                <th className="table-th text-right">Total</th>
                                <th className="table-th text-center">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="py-4">
                                    <EmptyState icon={Receipt} title="Sin facturas de cliente" description="Emite tu primera factura" />
                                </td></tr>
                            ) : filtered.map(inv => {
                                const cliente = businessPartners.find(b => b.id === inv.cliente_id);
                                const total = getDocumentTotal(inv.lineas, 'sale');
                                return (
                                    <tr key={inv.id} className="table-row">
                                        <td className="table-td font-mono font-semibold text-brand-700">{inv.numero_documento}</td>
                                        <td className="table-td text-gray-500 hidden sm:table-cell">{formatDate(inv.fecha)}</td>
                                        <td className="table-td">
                                            <p className="font-medium">{cliente?.nombre_comercial ?? '—'}</p>
                                            <p className="text-xs text-gray-400 hidden sm:block">{cliente?.rtn}</p>
                                        </td>
                                        <td className="table-td text-gray-500 hidden md:table-cell">{formatDate(inv.fecha_vencimiento)}</td>
                                        <td className="table-td text-gray-500 hidden lg:table-cell font-mono text-xs">{inv.orden_ref || '—'}</td>
                                        <td className="table-td text-right font-semibold">{formatCurrency(total)}</td>
                                        <td className="table-td text-center"><Badge label={inv.estado} /></td>
                                        <td className="table-td">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/ventas/facturas/${inv.id}`} className="icon-btn" title="Ver"><Eye size={15} /></Link>
                                                {!['Pagada', 'Anulada'].includes(inv.estado) && (
                                                    <button onClick={() => updateCustomerInvoice(inv.id, { estado: 'Anulada' })} className="icon-btn hover:text-red-600" title="Anular"><X size={15} /></button>
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
