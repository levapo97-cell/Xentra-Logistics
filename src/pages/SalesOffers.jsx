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

export default function SalesOffers() {
    const { salesOffers, updateSalesOffer, businessPartners } = useApp();
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    const filtered = salesOffers
        .filter(o => {
            const cliente = businessPartners.find(b => b.id === o.cliente_id);
            const q = search.toLowerCase();
            const matchSearch = !search || o.numero_documento.toLowerCase().includes(q) || cliente?.nombre_comercial?.toLowerCase().includes(q) || cliente?.nombre_legal?.toLowerCase().includes(q);
            const matchEstado = !filterEstado || o.estado === filterEstado;
            return matchSearch && matchEstado;
        })
        .sort((a, b) => b.numero_documento.localeCompare(a.numero_documento));

    const handleCancel = (id) => {
        updateSalesOffer(id, { estado: 'Cancelada' });
    };

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar por número o cliente..." className="flex-1 min-w-[200px]" />
                    <select className="input w-auto" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(e => <option key={e}>{e}</option>)}
                    </select>
                    <Link to="/ventas/ofertas/nueva" className="btn-primary"><Plus size={16} /> Nueva Oferta</Link>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Número</th>
                                <th className="table-th">Fecha</th>
                                <th className="table-th">Cliente</th>
                                <th className="table-th">Vendedor</th>
                                <th className="table-th text-right">Total</th>
                                <th className="table-th text-center">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="py-4">
                                    <EmptyState icon={FileText} title="Sin ofertas" description="Crea tu primera oferta de venta" />
                                </td></tr>
                            ) : filtered.map(offer => {
                                const cliente = businessPartners.find(b => b.id === offer.cliente_id);
                                const total = getDocumentTotal(offer.lineas, 'sale');
                                return (
                                    <tr key={offer.id} className="table-row">
                                        <td className="table-td">
                                            <span className="font-mono font-semibold text-brand-700">{offer.numero_documento}</span>
                                        </td>
                                        <td className="table-td text-gray-500 whitespace-nowrap">{formatDate(offer.fecha)}</td>
                                        <td className="table-td">
                                            <p className="font-medium text-gray-900">{cliente?.nombre_comercial ?? '—'}</p>
                                            <p className="text-xs text-gray-400">{cliente?.rtn}</p>
                                        </td>
                                        <td className="table-td text-gray-600">{offer.vendedor}</td>
                                        <td className="table-td text-right font-semibold text-gray-900">{formatCurrency(total)}</td>
                                        <td className="table-td text-center"><Badge label={offer.estado} /></td>
                                        <td className="table-td">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/ventas/ofertas/${offer.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Ver / Editar">
                                                    <Eye size={15} />
                                                </Link>
                                                {offer.estado !== 'Cancelada' && (
                                                    <button onClick={() => handleCancel(offer.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Cancelar">
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

            <FloatingActionButton onClick={() => { }} label="Nueva Oferta" />
        </div>
    );
}
