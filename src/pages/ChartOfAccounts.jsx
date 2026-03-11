import React, { useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const ACCOUNT_TYPES = ['Grupo', 'Detalle'];
const NIVELES = [1, 2, 3];

function AccountForm({ initial, onSave, onClose }) {
    const [form, setForm] = useState(initial || { code: '', name: '', type: 'Detalle', balance: 0, active: true, nivel: 3 });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                    <input className="input-field" value={form.code} onChange={e => set('code', e.target.value)} placeholder="ej. 1101" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
                        {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Cuenta *</label>
                <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="ej. Caja General" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Balance Inicial (L)</label>
                    <input type="number" className="input-field" value={form.balance} onChange={e => set('balance', parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                    <select className="input-field" value={form.nivel} onChange={e => set('nivel', parseInt(e.target.value))}>
                        {NIVELES.map(n => <option key={n} value={n}>Nivel {n}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="active" className="text-sm text-gray-700">Cuenta Activa</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn-primary" onClick={() => { if (form.code && form.name) { onSave(form); onClose(); } }}>Guardar</button>
            </div>
        </div>
    );
}

const TYPE_COLORS = { Grupo: 'bg-brand-50 text-brand-700', Detalle: 'bg-gray-100 text-gray-700' };

export default function ChartOfAccounts() {
    const { chartOfAccounts, addAccount, updateAccount, deleteAccount } = useApp();
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const filtered = chartOfAccounts.filter(acc =>
        acc.code.includes(search) || acc.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = (data) => {
        if (editing) { updateAccount(editing.id, data); }
        else { addAccount(data); }
        setEditing(null);
    };

    const openEdit = (acc) => { setEditing(acc); setModalOpen(true); };
    const openNew = () => { setEditing(null); setModalOpen(true); };

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código o nombre..." className="flex-1 min-w-[200px]" />
                    <button className="btn-primary" onClick={openNew}><Plus size={16} /> Nueva Cuenta</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Código</th>
                                <th className="table-th">Nombre de Cuenta</th>
                                <th className="table-th">Tipo</th>
                                <th className="table-th text-right">Balance</th>
                                <th className="table-th">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6}><EmptyState icon={BookOpen} title="No hay cuentas" description="Agrega tu primera cuenta contable." /></td></tr>
                            ) : filtered.map(acc => (
                                <tr key={acc.id} className="table-row">
                                    <td className="table-td font-mono font-bold text-brand-700">{acc.code}</td>
                                    <td className="table-td">
                                        <span style={{ paddingLeft: `${(acc.nivel - 1) * 16}px` }} className="flex items-center gap-1">
                                            {acc.nivel > 1 && <ChevronRight size={12} className="text-gray-400" />}
                                            <span className={acc.nivel === 1 ? 'font-bold uppercase text-gray-900' : acc.nivel === 2 ? 'font-semibold text-gray-800' : 'text-gray-700'}>{acc.name}</span>
                                        </span>
                                    </td>
                                    <td className="table-td">
                                        <span className={`badge ${TYPE_COLORS[acc.type] || 'bg-gray-100 text-gray-700'}`}>{acc.type}</span>
                                    </td>
                                    <td className="table-td text-right font-mono">{acc.type === 'Detalle' ? `L ${acc.balance.toLocaleString('es-HN', { minimumFractionDigits: 2 })}` : '—'}</td>
                                    <td className="table-td">
                                        <span className={`badge ${acc.active ? 'badge-success' : 'badge-danger'}`}>{acc.active ? 'Activa' : 'Inactiva'}</span>
                                    </td>
                                    <td className="table-td">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(acc)} className="icon-btn" title="Editar"><Pencil size={14} /></button>
                                            <button onClick={() => deleteAccount(acc.id)} className="icon-btn text-red-500" title="Desactivar"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Editar Cuenta' : 'Nueva Cuenta Contable'}>
                <AccountForm initial={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
            </Modal>
        </div>
    );
}
