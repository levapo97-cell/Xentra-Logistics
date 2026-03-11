import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';
import { formatDate, formatCurrency, getDocumentTotal } from '../utils/helpers';

const ESTADOS = ['Borrador', 'Enviada', 'Aprobada', 'Cancelada'];

export default function PurchaseQuotes() {
    const { purchaseQuotes, updatePurchaseQuote, businessPartners } = useApp();
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    const filtered = purchaseQuotes
        .filter(q => {
            const proveedor = businessPartners.find(b => b.id === q.proveedor_id);
            const query = search.toLowerCase();
            const matchSearch = !search || q.numero_documento.toLowerCase().includes(query) || proveedor?.nombre_comercial?.toLowerCase().includes(query);
            const matchEstado = !filterEstado || q.estado === filterEstado;
            return matchSearch && matchEstado;
        })
        .sort((a, b) => b.numero_documento.localeCompare(a.numero_documento));

    const handleCancel = (id) => updatePurchaseQuote(id, { estado: 'Cancelada' });
    const handleConvert = (id) => updatePurchaseQuote(id, { estado: 'Aprobada' });

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar por número o proveedor..." className="flex-1 min-w-[200px]" />
                    <select className="input w-auto" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <Link to="/compras/cotizaciones/nueva" className="btn-primary"><Plus size={16} /> Nueva Cotización</Link>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Número</th>
                                <th className="table-th">Fecha</th>
                                <th className="table-th">Proveedor</th>
                                <th className="table-th text-center">Moneda</th>
                                <th className="table-th text-right">Total</th>
                                <th className="table-th text-center">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="py-4">
                                    <EmptyState icon={FileText} title="Sin cotizaciones" description="Crea tu primera cotización de compra" />
                                </td></tr>
                            ) : filtered.map(quote => {
                                const proveedor = businessPartners.find(b => b.id === quote.proveedor_id);
                                const total = getDocumentTotal(quote.lineas, 'purchase');
                                return (
                                    <tr key={quote.id} className="table-row">
                                        <td className="table-td">
                                            <span className="font-mono font-semibold text-brand-700">{quote.numero_documento}</span>
                                        </td>
                                        <td className="table-td text-gray-500 whitespace-nowrap">{formatDate(quote.fecha)}</td>
                                        <td className="table-td">
                                            <p className="font-medium text-gray-900">{proveedor?.nombre_comercial ?? '—'}</p>
                                            <p className="text-xs text-gray-400">{proveedor?.rtn}</p>
                                        </td>
                                        <td className="table-td text-center">
                                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{quote.moneda}</span>
                                        </td>
                                        <td className="table-td text-right font-semibold text-gray-900">{formatCurrency(total)}</td>
                                        <td className="table-td text-center"><Badge label={quote.estado} /></td>
                                        <td className="table-td">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/compras/cotizaciones/${quote.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Ver / Editar">
                                                    <Eye size={15} />
                                                </Link>
                                                {quote.estado === 'Enviada' && (
                                                    <button onClick={() => handleConvert(quote.id)} className="btn-success btn-sm py-1 px-2 text-xs" title="Convertir a Orden">
                                                        Convertir
                                                    </button>
                                                )}
                                                {quote.estado !== 'Cancelada' && (
                                                    <button onClick={() => handleCancel(quote.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Cancelar">
                                                        <X size={15} />
                                                    </button>
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

            <FloatingActionButton onClick={() => { }} label="Nueva Cotización" />
        </div>
    );
}
