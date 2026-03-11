import React, { useState } from 'react';
import { Warehouse, Edit2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';

const emptyForm = { codigo: '', nombre: '', direccion: '', activo: true };

export default function Warehouses() {
    const { warehouses, addWarehouse, updateWarehouse } = useApp();
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const filtered = warehouses.filter(w =>
        !search || w.nombre.toLowerCase().includes(search.toLowerCase()) || w.codigo.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => { setEditingId(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
    const openEdit = (w) => { setEditingId(w.id); setForm({ ...w }); setErrors({}); setModalOpen(true); };

    const validate = () => {
        const e = {};
        if (!form.codigo.trim()) e.codigo = 'Requerido';
        if (!form.nombre.trim()) e.nombre = 'Requerido';
        if (warehouses.some(w => w.codigo === form.codigo && w.id !== editingId)) e.codigo = 'Código ya existe';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        editingId ? updateWarehouse(editingId, form) : addWarehouse(form);
        setModalOpen(false);
    };

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Buscar almacenes..." className="flex-1 min-w-[200px]" />
                    <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Almacén</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.length === 0 ? (
                    <div className="col-span-full card">
                        <EmptyState icon={Warehouse} title="No hay almacenes" description="Crea tu primer almacén" />
                    </div>
                ) : filtered.map(w => (
                    <div key={w.id} className="card hover:shadow-md transition-shadow duration-200 group">
                        <div className="flex items-start justify-between mb-3">
                            <span className="font-mono text-sm font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">{w.codigo}</span>
                            <div className="flex items-center gap-2">
                                <Badge label={w.activo ? 'Activo' : 'Inactivo'} />
                                <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg text-gray-300 group-hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 size={14} /></button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{w.nombre}</h3>
                        <div className="flex items-start gap-2 text-sm text-gray-500">
                            <Warehouse size={14} className="shrink-0 mt-0.5 text-gray-400" />
                            <p>{w.direccion}</p>
                        </div>
                    </div>
                ))}
            </div>

            <FloatingActionButton onClick={openCreate} label="Nuevo Almacén" />

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId ? 'Editar Almacén' : 'Nuevo Almacén'}
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                        <button className="btn-primary" onClick={handleSave}>{editingId ? 'Guardar Cambios' : 'Crear Almacén'}</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Código *</label>
                            <input className={`input font-mono uppercase ${errors.codigo ? 'border-red-400' : ''}`} value={form.codigo} onChange={e => set('codigo', e.target.value.toUpperCase())} placeholder="BDG-01" />
                            {errors.codigo && <p className="text-xs text-red-500 mt-1">{errors.codigo}</p>}
                        </div>
                        <div>
                            <label className="label">Estado</label>
                            <select className="input" value={form.activo ? 'activo' : 'inactivo'} onChange={e => set('activo', e.target.value === 'activo')}>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Nombre *</label>
                        <input className={`input ${errors.nombre ? 'border-red-400' : ''}`} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del almacén" />
                        {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
                    </div>
                    <div>
                        <label className="label">Dirección</label>
                        <textarea className="input resize-none" rows={2} value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Dirección completa" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
