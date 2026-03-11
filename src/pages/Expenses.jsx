import React, { useState } from 'react';
import { Wallet, Plus, Pencil, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const STATUSES = ['Pendiente', 'Aprobado', 'Rechazado'];

function ExpenseForm({ initial, departments, categories, subcategories, divisions, onSave, onClose }) {
    const today = new Date().toISOString().slice(0, 10);
    const [form, setForm] = useState(initial || {
        date: today, description: '', department_id: '', category_id: '', subcategory_id: '',
        division_id: '', amount: '', status: 'Pendiente', notes: '',
    });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const filteredSubs = subcategories.filter(s => s.category_id === form.category_id);
    const isValid = form.date && form.description && form.amount > 0;

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                    <input type="date" className="input-field" value={form.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto (L) *</label>
                    <input type="number" className="input-field" value={form.amount} onChange={e => set('amount', parseFloat(e.target.value) || '')} placeholder="0.00" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <input className="input-field" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe el gasto..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                    <select className="input-field" value={form.department_id} onChange={e => set('department_id', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {departments.filter(d => d.active).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">División</label>
                    <select className="input-field" value={form.division_id} onChange={e => set('division_id', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {divisions.filter(d => d.active).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select className="input-field" value={form.category_id} onChange={e => { set('category_id', e.target.value); set('subcategory_id', ''); }}>
                        <option value="">Seleccionar...</option>
                        {categories.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                    <select className="input-field" value={form.subcategory_id} onChange={e => set('subcategory_id', e.target.value)} disabled={!form.category_id}>
                        <option value="">Seleccionar...</option>
                        {filteredSubs.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
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
                <button className="btn-primary" disabled={!isValid} onClick={() => { onSave(form); onClose(); }}>Guardar</button>
            </div>
        </div>
    );
}

const STATUS_ICONS = {
    Aprobado: <CheckCircle size={14} className="text-green-500" />,
    Pendiente: <Clock size={14} className="text-yellow-500" />,
    Rechazado: <XCircle size={14} className="text-red-500" />,
};
const STATUS_COLORS = { Aprobado: 'badge-success', Pendiente: 'badge-warning', Rechazado: 'badge-danger' };

export default function Expenses() {
    const { expenses, addExpense, updateExpense, deleteExpense, departments, expenseCategories, expenseSubcategories, divisions } = useApp();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const filtered = expenses.filter(e => {
        const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filterStatus === 'Todos' || e.status === filterStatus;
        return matchSearch && matchFilter;
    });

    const totalAprobado = expenses.filter(e => e.status === 'Aprobado').reduce((s, e) => s + (e.amount || 0), 0);
    const totalPendiente = expenses.filter(e => e.status === 'Pendiente').reduce((s, e) => s + (e.amount || 0), 0);

    const getDeptName = (id) => departments.find(d => d.id === id)?.name || '—';

    const handleSave = (data) => {
        if (editing) updateExpense(editing.id, data);
        else addExpense(data);
        setEditing(null);
    };

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="text-green-600" size={20} /></div>
                    <div><p className="text-xs text-gray-500">Gastos Aprobados</p><p className="text-lg font-bold text-green-700">L {totalAprobado.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</p></div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center"><Clock className="text-yellow-600" size={20} /></div>
                    <div><p className="text-xs text-gray-500">Pendientes de Aprobación</p><p className="text-lg font-bold text-yellow-700">L {totalPendiente.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</p></div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center"><Wallet className="text-brand-600" size={20} /></div>
                    <div><p className="text-xs text-gray-500">Total Registrado</p><p className="text-lg font-bold text-brand-700">L {expenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</p></div>
                </div>
            </div>

            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar gasto..." className="flex-1 min-w-[200px]" />
                    <select className="input-field w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option>Todos</option>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Nuevo Gasto</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Fecha</th>
                                <th className="table-th">Descripción</th>
                                <th className="table-th">Departamento</th>
                                <th className="table-th text-right">Monto</th>
                                <th className="table-th">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6}><EmptyState icon={Wallet} title="No hay gastos" description="Registra tus gastos corporativos aquí." /></td></tr>
                            ) : filtered.map(e => (
                                <tr key={e.id} className="table-row">
                                    <td className="table-td">{e.date}</td>
                                    <td className="table-td font-medium">{e.description}</td>
                                    <td className="table-td">{getDeptName(e.department_id)}</td>
                                    <td className="table-td text-right font-mono">L {(e.amount || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</td>
                                    <td className="table-td">
                                        <span className={`badge ${STATUS_COLORS[e.status] || 'bg-gray-100'} flex items-center gap-1 w-fit`}>
                                            {STATUS_ICONS[e.status]} {e.status}
                                        </span>
                                    </td>
                                    <td className="table-td">
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditing(e); setModalOpen(true); }} className="icon-btn" title="Editar"><Pencil size={14} /></button>
                                            <button onClick={() => deleteExpense(e.id)} className="icon-btn text-red-500" title="Eliminar"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Editar Gasto' : 'Registrar Gasto'}>
                <ExpenseForm
                    initial={editing}
                    departments={departments}
                    categories={expenseCategories}
                    subcategories={expenseSubcategories}
                    divisions={divisions}
                    onSave={handleSave}
                    onClose={() => { setModalOpen(false); setEditing(null); }}
                />
            </Modal>
        </div>
    );
}
