import React, { useState } from 'react';
import { MapPin, Plus, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

function DivisionForm({ initial, onSave, onClose }) {
    const [form, setForm] = useState(initial || { code: '', name: '', manager: '', active: true });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                    <input className="input-field" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="ej. SPS" maxLength={5} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="ej. Sucursal San Pedro Sula" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gerente / Responsable</label>
                <input className="input-field" value={form.manager} onChange={e => set('manager', e.target.value)} placeholder="Nombre del responsable" />
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="divActive" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <label htmlFor="divActive" className="text-sm text-gray-700">División Activa</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn-primary" disabled={!form.code || !form.name} onClick={() => { onSave(form); onClose(); }}>Guardar</button>
            </div>
        </div>
    );
}

export default function Divisions() {
    const { divisions, addDivision, updateDivision } = useApp();
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const filtered = divisions.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase()));

    const handleSave = (data) => {
        if (editing) updateDivision(editing.id, data);
        else addDivision(data);
        setEditing(null);
    };

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar división..." className="flex-1 min-w-[200px]" />
                    <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={16} /> Nueva División</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Código</th>
                                <th className="table-th">Nombre</th>
                                <th className="table-th">Gerente</th>
                                <th className="table-th">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5}><EmptyState icon={MapPin} title="No hay divisiones" description="Define las divisiones o sucursales de tu empresa." /></td></tr>
                            ) : filtered.map(d => (
                                <tr key={d.id} className="table-row">
                                    <td className="table-td font-mono font-bold text-brand-700">{d.code}</td>
                                    <td className="table-td font-medium">{d.name}</td>
                                    <td className="table-td">{d.manager}</td>
                                    <td className="table-td"><span className={`badge ${d.active ? 'badge-success' : 'badge-danger'}`}>{d.active ? 'Activa' : 'Inactiva'}</span></td>
                                    <td className="table-td">
                                        <button onClick={() => { setEditing(d); setModalOpen(true); }} className="icon-btn"><Pencil size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Editar División' : 'Nueva División'}>
                <DivisionForm initial={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(null); }} />
            </Modal>
        </div>
    );
}
