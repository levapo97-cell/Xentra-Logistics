import React, { useState } from 'react';
import { Layers, Plus, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

function SubcategoryForm({ initial, categories, onSave, onClose }) {
    const [form, setForm] = useState(initial || { category_id: '', name: '', description: '', active: true });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="p-4 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Padre *</label>
                <select className="input-field" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {categories.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="ej. Combustible" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea className="input-field" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="subActive" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="subActive" className="text-sm text-gray-700">Subcategoría Activa</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn-primary" disabled={!form.name || !form.category_id} onClick={() => { onSave(form); onClose(); }}>Guardar</button>
            </div>
        </div>
    );
}

export default function Subcategories() {
    const { expenseSubcategories, addExpenseSubcategory, updateExpenseSubcategory, expenseCategories } = useApp();
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const filtered = expenseSubcategories.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = !filterCat || s.category_id === filterCat;
        return matchSearch && matchCat;
    });

    const getCatName = (id) => expenseCategories.find(c => c.id === id)?.name || '—';

    const handleSave = (data) => {
        if (editing) updateExpenseSubcategory(editing.id, data);
        else addExpenseSubcategory(data);
        setEditing(null);
    };

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar subcategoría..." className="flex-1 min-w-[200px]" />
                    <select className="input-field w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                        <option value="">Todas las categorías</option>
                        {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Nueva Subcategoría</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Nombre</th>
                                <th className="table-th">Categoría</th>
                                <th className="table-th">Descripción</th>
                                <th className="table-th">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5}><EmptyState icon={Layers} title="No hay subcategorías" description="Crea subcategorías para clasificar mejor tus gastos." /></td></tr>
                            ) : filtered.map(s => (
                                <tr key={s.id} className="table-row">
                                    <td className="table-td font-medium">{s.name}</td>
                                    <td className="table-td"><span className="badge bg-brand-50 text-brand-700">{getCatName(s.category_id)}</span></td>
                                    <td className="table-td text-gray-500">{s.description}</td>
                                    <td className="table-td"><span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}>{s.active ? 'Activa' : 'Inactiva'}</span></td>
                                    <td className="table-td">
                                        <button onClick={() => { setEditing(s); setModalOpen(true); }} className="icon-btn"><Pencil size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Editar Subcategoría' : 'Nueva Subcategoría'}>
                <SubcategoryForm initial={editing} categories={expenseCategories} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
            </Modal>
        </div>
    );
}
