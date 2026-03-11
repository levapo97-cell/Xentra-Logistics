import React, { useState } from 'react';
import { CreditCard, Plus, Pencil, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const METHODS = ['Transferencia', 'Cheque', 'Efectivo', 'Depósito', 'Tarjeta'];
const TIPOS = ['COBRO', 'PAGO'];
const STATUSES = ['Pendiente', 'Aplicado', 'Anulado'];

// ACCOUNTS is now loaded from chartOfAccounts context

function PaymentForm({ initial, partners, accounts, onSave, onClose }) {
    const today = new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState(initial || {
        date: today, reference: '', partner_id: '', partner: '', tipo: 'COBRO',
        amount: '', method: 'Transferencia', account: ACCOUNTS[0], document_ref: '', status: 'Pendiente', notes: '',
    });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handlePartner = (id) => {
        const bp = partners.find(p => p.id === id);
        set('partner_id', id);
        if (bp) set('partner', bp.nombre_comercial || bp.nombre_legal);
    };

    const isValid = form.date && form.reference && form.partner_id && form.amount > 0;

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                    <input type="date" className="input-field" value={form.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referencia *</label>
                    <input className="input-field" value={form.reference} onChange={e => set('reference', e.target.value)} placeholder="PAY-000007" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <select className="input-field" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                        {TIPOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Socio Comercial *</label>
                    <select className="input-field" value={form.partner_id} onChange={e => handlePartner(e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {partners.filter(p => p.estado).map(p => (
                            <option key={p.id} value={p.id}>{p.nombre_comercial || p.nombre_legal}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto (L) *</label>
                    <input type="number" className="input-field" value={form.amount} onChange={e => set('amount', parseFloat(e.target.value) || '')} placeholder="0.00" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                    <select className="input-field" value={form.method} onChange={e => set('method', e.target.value)}>
                        {METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Contable</label>
                    <select className="input-field" value={form.account} onChange={e => set('account', e.target.value)}>
                        <option value="">Seleccionar cuenta...</option>
                        {accounts.map(a => <option key={a.id} value={`${a.codigo} - ${a.nombre}`}>{a.codigo} – {a.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doc. Referencia</label>
                    <input className="input-field" value={form.document_ref} onChange={e => set('document_ref', e.target.value)} placeholder="OV-000001" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea className="input-field" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn-primary" disabled={!isValid} onClick={() => { onSave(form); onClose(); }}>Registrar</button>
            </div>
        </div>
    );
}

const STATUS_COLORS = { Aplicado: 'badge-success', Pendiente: 'badge-warning', Anulado: 'badge-danger' };

export default function Payments() {
    const { payments, addPayment, updatePayment, businessPartners, chartOfAccounts } = useApp();
    const activeAccounts = chartOfAccounts.filter(a => a.active !== false && a.tipo === 'Detalle');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Todos');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const filtered = payments.filter(p => {
        const matchSearch = p.reference.toLowerCase().includes(search.toLowerCase()) || p.partner.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'Todos' || p.tipo === filter;
        return matchSearch && matchFilter;
    });

    const totalCobros = payments.filter(p => p.tipo === 'COBRO' && p.status === 'Aplicado').reduce((s, p) => s + p.amount, 0);
    const totalPagos = payments.filter(p => p.tipo === 'PAGO' && p.status === 'Aplicado').reduce((s, p) => s + p.amount, 0);

    const handleSave = (data) => {
        if (editing) updatePayment(editing.id, data);
        else addPayment(data);
        setEditing(null);
    };

    return (
        <div className="space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><ArrowUpCircle className="text-green-600" size={20} /></div>
                    <div><p className="text-xs text-gray-500">Cobros Aplicados</p><p className="text-lg font-bold text-green-700">L {totalCobros.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</p></div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><ArrowDownCircle className="text-red-500" size={20} /></div>
                    <div><p className="text-xs text-gray-500">Pagos Realizados</p><p className="text-lg font-bold text-red-600">L {totalPagos.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</p></div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center"><CreditCard className="text-brand-600" size={20} /></div>
                    <div><p className="text-xs text-gray-500">Flujo Neto</p><p className={`text-lg font-bold ${totalCobros - totalPagos >= 0 ? 'text-brand-700' : 'text-red-600'}`}>L {(totalCobros - totalPagos).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</p></div>
                </div>
            </div>

            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar por referencia o socio..." className="flex-1 min-w-[200px]" />
                    <select className="input-field w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
                        <option>Todos</option>
                        <option>COBRO</option>
                        <option>PAGO</option>
                    </select>
                    <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Nuevo</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Fecha</th>
                                <th className="table-th">Referencia</th>
                                <th className="table-th">Tipo</th>
                                <th className="table-th">Socio</th>
                                <th className="table-th text-right">Monto</th>
                                <th className="table-th">Método</th>
                                <th className="table-th">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8}><EmptyState icon={CreditCard} title="No se encontraron pagos" description="Registra un nuevo pago o cobro." /></td></tr>
                            ) : filtered.map(p => (
                                <tr key={p.id} className="table-row">
                                    <td className="table-td">{p.date}</td>
                                    <td className="table-td font-medium text-brand-700">{p.reference}</td>
                                    <td className="table-td">
                                        <span className={`badge ${p.tipo === 'COBRO' ? 'badge-success' : 'badge-danger'}`}>{p.tipo}</span>
                                    </td>
                                    <td className="table-td">{p.partner}</td>
                                    <td className="table-td text-right font-mono">L {p.amount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</td>
                                    <td className="table-td">{p.method}</td>
                                    <td className="table-td">
                                        <span className={`badge ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                                    </td>
                                    <td className="table-td">
                                        <button onClick={() => { setEditing(p); setModalOpen(true); }} className="icon-btn" title="Editar"><Pencil size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Editar Pago/Cobro' : 'Registrar Pago/Cobro'}>
                <PaymentForm initial={editing} partners={businessPartners} accounts={activeAccounts} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
            </Modal>
        </div>
    );
}
