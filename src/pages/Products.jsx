import React, { useState } from 'react';
import { Package, Edit2, Plus, LayoutGrid, List } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';

const CATEGORIAS = ['Alimentos', 'Empaques', 'Lubricantes', 'Tecnología', 'Otros'];
const UOM_OPTIONS = ['UND', 'KG', 'LT', 'CJA', 'PAQ'];

const emptyForm = {
    sku: '', nombre: '', descripcion: '', categoria: 'Alimentos',
    uom: 'UND', impuesto_pct: 15, precio_venta: 0, costo_compra: 0,
    stock_minimo: 5, activo: true,
};

export default function Products() {
    const { products, addProduct, updateProduct } = useApp();
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterActivo, setFilterActivo] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const filtered = products.filter(p => {
        const s = search.toLowerCase();
        const matchSearch = !search || p.sku.toLowerCase().includes(s) || p.nombre.toLowerCase().includes(s) || p.categoria.toLowerCase().includes(s);
        const matchCat = !filterCat || p.categoria === filterCat;
        const matchActivo = filterActivo === '' ? true : filterActivo === 'activo' ? p.activo : !p.activo;
        return matchSearch && matchCat && matchActivo;
    });

    const openCreate = () => { setEditingId(null); setForm(emptyForm); setErrors({}); setModalOpen(true); };
    const openEdit = (p) => { setEditingId(p.id); setForm({ ...p }); setErrors({}); setModalOpen(true); };

    const validate = () => {
        const e = {};
        if (!form.sku.trim()) e.sku = 'Requerido';
        if (!form.nombre.trim()) e.nombre = 'Requerido';
        if (products.some(p => p.sku === form.sku && p.id !== editingId)) e.sku = 'SKU ya existe';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        const data = {
            ...form,
            impuesto_pct: parseFloat(form.impuesto_pct) || 0,
            precio_venta: parseFloat(form.precio_venta) || 0,
            costo_compra: parseFloat(form.costo_compra) || 0,
            stock_minimo: parseFloat(form.stock_minimo) || 0,
        };
        editingId ? updateProduct(editingId, data) : addProduct(data);
        setModalOpen(false);
    };

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    return (
        <div className="space-y-5">
            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="SKU, nombre, categoría..." className="flex-1 min-w-[200px]" />
                    <select className="input w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                        <option value="">Todas las categorías</option>
                        {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select className="input w-auto" value={filterActivo} onChange={e => setFilterActivo(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        <button onClick={() => setViewMode('table')} className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-brand-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><List size={16} /></button>
                        <button onClick={() => setViewMode('cards')} className={`p-2 transition-colors ${viewMode === 'cards' ? 'bg-brand-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}><LayoutGrid size={16} /></button>
                    </div>
                    <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Producto</button>
                </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-th">SKU</th>
                                    <th className="table-th">Nombre</th>
                                    <th className="table-th">Categoría</th>
                                    <th className="table-th">UOM</th>
                                    <th className="table-th">Precio Venta</th>
                                    <th className="table-th">Costo</th>
                                    <th className="table-th">Imp. %</th>
                                    <th className="table-th">Estado</th>
                                    <th className="table-th">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={9} className="py-4">
                                        <EmptyState icon={Package} title="Sin productos" description="Crea tu primer producto" />
                                    </td></tr>
                                ) : filtered.map(p => (
                                    <tr key={p.id} className="table-row">
                                        <td className="table-td"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{p.sku}</span></td>
                                        <td className="table-td">
                                            <p className="font-medium text-gray-900">{p.nombre}</p>
                                            <p className="text-xs text-gray-400 truncate max-w-xs">{p.descripcion}</p>
                                        </td>
                                        <td className="table-td text-gray-600">{p.categoria}</td>
                                        <td className="table-td"><span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{p.uom}</span></td>
                                        <td className="table-td font-medium text-gray-900">L {Number(p.precio_venta).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</td>
                                        <td className="table-td text-gray-600">L {Number(p.costo_compra).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</td>
                                        <td className="table-td text-gray-600">{p.impuesto_pct}%</td>
                                        <td className="table-td"><Badge label={p.activo ? 'Activo' : 'Inactivo'} /></td>
                                        <td className="table-td">
                                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 size={15} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Cards View */}
            {viewMode === 'cards' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.length === 0 ? (
                        <div className="col-span-full">
                            <EmptyState icon={Package} title="Sin productos" description="Crea tu primer producto" />
                        </div>
                    ) : filtered.map(p => (
                        <div key={p.id} className="card hover:shadow-md transition-shadow duration-200 group">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="font-mono text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-semibold">{p.sku}</span>
                                    <Badge label={p.activo ? 'Activo' : 'Inactivo'} className="ml-2" />
                                </div>
                                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-300 hover:text-brand-600 hover:bg-brand-50 transition-colors opacity-0 group-hover:opacity-100"><Edit2 size={14} /></button>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{p.nombre}</h3>
                            <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.descripcion}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-gray-400">Precio Venta</p>
                                    <p className="font-semibold text-gray-800">L {Number(p.precio_venta).toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-gray-400">Costo</p>
                                    <p className="font-semibold text-gray-800">L {Number(p.costo_compra).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                <span>{p.categoria}</span>
                                <span className="font-semibold">{p.uom} · {p.impuesto_pct}% ISV</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <FloatingActionButton onClick={openCreate} label="Nuevo Producto" />

            {/* Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId ? 'Editar Producto' : 'Nuevo Producto'}
                size="lg"
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                        <button className="btn-primary" onClick={handleSave}>{editingId ? 'Guardar Cambios' : 'Crear Producto'}</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">SKU *</label>
                            <input className={`input font-mono ${errors.sku ? 'border-red-400' : ''}`} value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="PROD-001" />
                            {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
                        </div>
                        <div>
                            <label className="label">Categoría</label>
                            <select className="input" value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Nombre *</label>
                        <input className={`input ${errors.nombre ? 'border-red-400' : ''}`} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre del producto" />
                        {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
                    </div>
                    <div>
                        <label className="label">Descripción</label>
                        <textarea className="input resize-none" rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Descripción detallada..." />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label">UOM</label>
                            <select className="input" value={form.uom} onChange={e => set('uom', e.target.value)}>
                                {UOM_OPTIONS.map(u => <option key={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">ISV %</label>
                            <input className="input" type="number" value={form.impuesto_pct} onChange={e => set('impuesto_pct', e.target.value)} min={0} max={100} />
                        </div>
                        <div>
                            <label className="label">Stock Mínimo</label>
                            <input className="input" type="number" value={form.stock_minimo} onChange={e => set('stock_minimo', e.target.value)} min={0} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Precio Venta (L)</label>
                            <input className="input" type="number" value={form.precio_venta} onChange={e => set('precio_venta', e.target.value)} min={0} step={0.01} />
                        </div>
                        <div>
                            <label className="label">Costo Compra (L)</label>
                            <input className="input" type="number" value={form.costo_compra} onChange={e => set('costo_compra', e.target.value)} min={0} step={0.01} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Estado</label>
                        <select className="input" value={form.activo ? 'activo' : 'inactivo'} onChange={e => set('activo', e.target.value === 'activo')}>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
