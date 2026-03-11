import React, { useState } from 'react';
import { Building2, Plus, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

function DepartmentForm({ initial, onSave, onClose }) {
    const [form, setForm] = useState(initial || { code: '', name: '', leader: '', active: true });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const isValid = form.code && form.name;

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                    <input className="input-field" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="ej. ADM" maxLength={5} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del departamento" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Líder / Responsable</label>
                <input className="input-field" value={form.leader} onChange={e => set('leader', e.target.value)} placeholder="Nombre del responsable" />
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="deptActive" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="deptActive" className="text-sm text-gray-700">Departamento Activo</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn-primary" disabled={!isValid} onClick={() => { onSave(form); onClose(); }}>Guardar</button>
            </div>
        </div>
    );
}

export default function Departments() {
    const { departments, addDepartment, updateDepartment } = useApp();
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const filtered = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase()));

    const handleSave = (data) => {
        if (editing) updateDepartment(editing.id, data);
        else addDepartment(data);
        setEditing(null);
    };

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar departamento..." className="flex-1 min-w-[200px]" />
                    <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Nuevo Departamento</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Código</th>
                                <th className="table-th">Nombre</th>
                                <th className="table-th">Líder</th>
                                <th className="table-th">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5}><EmptyState icon={Building2} title="No hay departamentos" description="Organiza tus gastos por departamentos." /></td></tr>
                            ) : filtered.map(d => (
                                <tr key={d.id} className="table-row">
                                    <td className="table-td font-mono font-bold text-brand-700">{d.code}</td>
                                    <td className="table-td font-medium">{d.name}</td>
                                    <td className="table-td">{d.leader}</td>
                                    <td className="table-td">
                                        <span className={`badge ${d.active ? 'badge-success' : 'badge-danger'}`}>{d.active ? 'Activo' : 'Inactivo'}</span>
                                    </td>
                                    <td className="table-td">
                                        <button onClick={() => { setEditing(d); setModalOpen(true); }} className="icon-btn" title="Editar"><Pencil size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Editar Departamento' : 'Nuevo Departamento'}>
                <DepartmentForm initial={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
            </Modal>
        </div>
    );
}
