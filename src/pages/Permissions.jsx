import React, { useState } from 'react';
import { ShieldCheck, Plus, Pencil, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

const ALL_MODULES = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'socios', label: 'Socios Comerciales' },
    { key: 'inventario', label: 'Inventario' },
    { key: 'ventas', label: 'Ventas' },
    { key: 'compras', label: 'Compras' },
    { key: 'finanzas', label: 'Finanzas' },
    { key: 'gastos', label: 'Gastos' },
    { key: 'configuracion', label: 'Configuración' },
];

function RoleForm({ initial, onSave, onClose }) {
    const [form, setForm] = useState(initial || { name: '', description: '', permissions: [], active: true, userCount: 0 });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const togglePerm = (key) => {
        set('permissions', form.permissions.includes(key)
            ? form.permissions.filter(p => p !== key)
            : [...form.permissions, key]);
    };

    return (
        <div className="p-4 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol *</label>
                <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="ej. Ventas" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input className="input-field" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción del rol" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Acceso a Módulos</label>
                <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {ALL_MODULES.map(m => (
                        <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.permissions.includes(m.key)}
                                onChange={() => togglePerm(m.key)}
                                className="w-4 h-4 accent-brand-600"
                            />
                            <span className="text-sm text-gray-700">{m.label}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="rolActive" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="rolActive" className="text-sm text-gray-700">Rol Activo</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn-primary" disabled={!form.name} onClick={() => { onSave(form); onClose(); }}>Guardar</button>
            </div>
        </div>
    );
}

export default function Permissions() {
    const { roles, addRole, updateRole } = useApp();
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const filtered = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

    const handleSave = (data) => {
        if (editing) updateRole(editing.id, data);
        else addRole(data);
        setEditing(null);
    };

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar rol..." className="flex-1 min-w-[200px]" />
                    <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Nuevo Rol</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Nombre del Rol</th>
                                <th className="table-th">Descripción</th>
                                <th className="table-th">Usuarios</th>
                                <th className="table-th">Módulos con Acceso</th>
                                <th className="table-th">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6}><EmptyState icon={ShieldCheck} title="No hay roles configurados" description="Define roles y permisos para tus usuarios." /></td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} className="table-row">
                                    <td className="table-td font-medium">{r.name}</td>
                                    <td className="table-td text-gray-500 text-sm">{r.description}</td>
                                    <td className="table-td">
                                        <span className="flex items-center gap-1"><Users size={13} className="text-gray-400" />{r.userCount}</span>
                                    </td>
                                    <td className="table-td">
                                        <div className="flex flex-wrap gap-1">
                                            {r.permissions.map(p => {
                                                const mod = ALL_MODULES.find(m => m.key === p);
                                                return <span key={p} className="badge bg-brand-50 text-brand-700 text-xs">{mod?.label || p}</span>;
                                            })}
                                        </div>
                                    </td>
                                    <td className="table-td"><span className={`badge ${r.active ? 'badge-success' : 'badge-danger'}`}>{r.active ? 'Activo' : 'Inactivo'}</span></td>
                                    <td className="table-td">
                                        <button onClick={() => { setEditing(r); setModalOpen(true); }} className="icon-btn"><Pencil size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Editar Rol' : 'Nuevo Rol'}>
                <RoleForm initial={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
            </Modal>
        </div>
    );
}
