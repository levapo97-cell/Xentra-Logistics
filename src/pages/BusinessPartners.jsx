import React, { useState } from 'react';
import { Users, Edit2, UserX, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';
import { generateId } from '../utils/helpers';

const TIPOS = ['CLIENTE', 'PROVEEDOR', 'AMBOS'];
const CONDICIONES = ['Contado', '15 días', '30 días'];

const emptyForm = {
    tipo: 'CLIENTE',
    nombre_legal: '',
    nombre_comercial: '',
    rtn: '',
    email: '',
    telefono: '',
    direccion: '',
    condicion_pago: 'Contado',
    limite_credito: 0,
    estado: true,
};

export default function BusinessPartners() {
    const { businessPartners, addBusinessPartner, updateBusinessPartner, deleteBusinessPartner } = useApp();
    const [search, setSearch] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const filtered = businessPartners.filter(bp => {
        const matchSearch = !search ||
            bp.nombre_legal.toLowerCase().includes(search.toLowerCase()) ||
            bp.nombre_comercial.toLowerCase().includes(search.toLowerCase()) ||
            bp.rtn.includes(search);
        const matchTipo = !filterTipo || bp.tipo === filterTipo;
        const matchEstado = filterEstado === '' ? true : filterEstado === 'activo' ? bp.estado : !bp.estado;
        return matchSearch && matchTipo && matchEstado;
    });

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (bp) => {
        setEditingId(bp.id);
        setForm({ ...bp });
        setErrors({});
        setModalOpen(true);
    };

    const validate = () => {
        const e = {};
        if (!form.nombre_legal.trim()) e.nombre_legal = 'Requerido';
        if (!form.rtn.trim()) e.rtn = 'Requerido';
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email inválido';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        const data = { ...form, limite_credito: parseFloat(form.limite_credito) || 0 };
        if (editingId) {
            updateBusinessPartner(editingId, data);
        } else {
            addBusinessPartner(data);
        }
        setModalOpen(false);
    };

    const handleDeactivate = (id) => {
        deleteBusinessPartner(id);
    };

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    return (
        <div className="space-y-5">
            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar por nombre, RTN..."
                        className="flex-1 min-w-[200px]"
                    />
                    <select className="input w-auto" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
                        <option value="">Todos los tipos</option>
                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="input w-auto" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                    <button className="btn-primary" onClick={openCreate}>
                        <Plus size={16} /> Nuevo Socio
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Nombre Legal / Comercial</th>
                                <th className="table-th">RTN / Fiscal</th>
                                <th className="table-th">Tipo</th>
                                <th className="table-th">Condición Pago</th>
                                <th className="table-th">Límite Crédito</th>
                                <th className="table-th">Estado</th>
                                <th className="table-th">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="py-4">
                                    <EmptyState icon={Users} title="No se encontraron socios" description="Ajusta los filtros o crea uno nuevo" />
                                </td></tr>
                            ) : filtered.map(bp => (
                                <tr key={bp.id} className="table-row">
                                    <td className="table-td">
                                        <p className="font-medium text-gray-900">{bp.nombre_legal}</p>
                                        <p className="text-xs text-gray-400">{bp.nombre_comercial}</p>
                                    </td>
                                    <td className="table-td">
                                        <span className="font-mono text-xs text-gray-600">{bp.rtn}</span>
                                    </td>
                                    <td className="table-td"><Badge label={bp.tipo} /></td>
                                    <td className="table-td text-gray-600">{bp.condicion_pago}</td>
                                    <td className="table-td">
                                        {(bp.tipo === 'CLIENTE' || bp.tipo === 'AMBOS')
                                            ? <span className="font-medium text-gray-800">L {Number(bp.limite_credito).toLocaleString()}</span>
                                            : <span className="text-gray-400">—</span>
                                        }
                                    </td>
                                    <td className="table-td">
                                        <Badge label={bp.estado ? 'Activo' : 'Inactivo'} />
                                    </td>
                                    <td className="table-td">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEdit(bp)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            {bp.estado && (
                                                <button
                                                    onClick={() => handleDeactivate(bp.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Desactivar"
                                                >
                                                    <UserX size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <FloatingActionButton onClick={openCreate} label="Nuevo Socio" />

            {/* Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId ? 'Editar Socio de Negocio' : 'Nuevo Socio de Negocio'}
                size="lg"
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                        <button className="btn-primary" onClick={handleSave}>
                            {editingId ? 'Guardar Cambios' : 'Crear Socio'}
                        </button>
                    </>
                }
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tipo *</label>
                            <select className="input" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                                {TIPOS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Estado</label>
                            <select className="input" value={form.estado ? 'activo' : 'inactivo'} onChange={e => set('estado', e.target.value === 'activo')}>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nombre Legal *</label>
                            <input className={`input ${errors.nombre_legal ? 'border-red-400' : ''}`} value={form.nombre_legal}
                                onChange={e => set('nombre_legal', e.target.value)} placeholder="Razón social completa" />
                            {errors.nombre_legal && <p className="text-xs text-red-500 mt-1">{errors.nombre_legal}</p>}
                        </div>
                        <div>
                            <label className="label">Nombre Comercial</label>
                            <input className="input" value={form.nombre_comercial}
                                onChange={e => set('nombre_comercial', e.target.value)} placeholder="Nombre comercial" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">RTN / ID Fiscal *</label>
                            <input className={`input font-mono ${errors.rtn ? 'border-red-400' : ''}`} value={form.rtn}
                                onChange={e => set('rtn', e.target.value)} placeholder="0000-0000-000000" />
                            {errors.rtn && <p className="text-xs text-red-500 mt-1">{errors.rtn}</p>}
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input className={`input ${errors.email ? 'border-red-400' : ''}`} type="email" value={form.email}
                                onChange={e => set('email', e.target.value)} placeholder="contacto@empresa.hn" />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Teléfono</label>
                            <input className="input" value={form.telefono}
                                onChange={e => set('telefono', e.target.value)} placeholder="+504 0000-0000" />
                        </div>
                        <div>
                            <label className="label">Condición de Pago</label>
                            <select className="input" value={form.condicion_pago} onChange={e => set('condicion_pago', e.target.value)}>
                                {CONDICIONES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Dirección</label>
                        <textarea className="input resize-none" rows={2} value={form.direccion}
                            onChange={e => set('direccion', e.target.value)} placeholder="Dirección completa" />
                    </div>

                    {(form.tipo === 'CLIENTE' || form.tipo === 'AMBOS') && (
                        <div>
                            <label className="label">Límite de Crédito (L)</label>
                            <input className="input" type="number" value={form.limite_credito}
                                onChange={e => set('limite_credito', e.target.value)} min={0} step={1000} />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
