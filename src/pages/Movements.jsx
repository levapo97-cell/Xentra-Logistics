import React, { useState } from 'react';
import { ArrowRightLeft, Plus, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';
import { formatDate, generateId } from '../utils/helpers';

const TIPOS = ['ENTRADA', 'SALIDA', 'AJUSTE', 'TRANSFERENCIA'];

const emptyForm = {
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'ENTRADA',
    product_id: '',
    warehouse_id: '',
    warehouse_destino_id: '',
    cantidad: '',
    costo_unitario: '',
    referencia: '',
    observacion: '',
};

export default function Movements() {
    const { movements, products, warehouses, stock, addMovement } = useApp();
    const [search, setSearch] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterWh, setFilterWh] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [stockError, setStockError] = useState('');

    const filtered = [...movements]
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id))
        .filter(m => {
            const prod = products.find(p => p.id === m.product_id);
            const q = search.toLowerCase();
            const matchSearch = !search || prod?.nombre?.toLowerCase().includes(q) || prod?.sku?.toLowerCase().includes(q) || m.referencia?.toLowerCase().includes(q);
            const matchTipo = !filterTipo || m.tipo === filterTipo;
            const matchWh = !filterWh || m.warehouse_id === filterWh;
            return matchSearch && matchTipo && matchWh;
        });

    const openCreate = () => {
        setForm({ ...emptyForm, product_id: products[0]?.id ?? '', warehouse_id: warehouses[0]?.id ?? '' });
        setStockError('');
        setModalOpen(true);
    };

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const getAvailable = (productId, warehouseId) => {
        const s = stock.find(s => s.product_id === productId && s.warehouse_id === warehouseId);
        return s ? s.on_hand - s.reserved : 0;
    };

    const handleSave = () => {
        setStockError('');
        if (!form.product_id || !form.warehouse_id || !form.cantidad) return;
        const qty = parseFloat(form.cantidad);
        if (qty <= 0) return;

        if (form.tipo === 'SALIDA') {
            const avail = getAvailable(form.product_id, form.warehouse_id);
            if (qty > avail) {
                setStockError(`Stock insuficiente. Disponible: ${avail}`);
                return;
            }
        }
        if (form.tipo === 'TRANSFERENCIA') {
            if (!form.warehouse_destino_id || form.warehouse_destino_id === form.warehouse_id) {
                setStockError('Selecciona un almacén destino diferente al origen.');
                return;
            }
            const avail = getAvailable(form.product_id, form.warehouse_id);
            if (qty > avail) {
                setStockError(`Stock insuficiente en origen. Disponible: ${avail}`);
                return;
            }
        }

        addMovement({
            ...form,
            cantidad: qty,
            costo_unitario: parseFloat(form.costo_unitario) || 0,
        });
        setModalOpen(false);
    };

    return (
        <div className="space-y-5">
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput value={search} onChange={setSearch} placeholder="Producto, SKU, referencia..." className="flex-1 min-w-[200px]" />
                    <select className="input w-auto" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
                        <option value="">Todos los tipos</option>
                        {TIPOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select className="input w-auto" value={filterWh} onChange={e => setFilterWh(e.target.value)}>
                        <option value="">Todos los almacenes</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.nombre}</option>)}
                    </select>
                    <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Movimiento</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Fecha</th>
                                <th className="table-th">Tipo</th>
                                <th className="table-th">Producto</th>
                                <th className="table-th">Almacén</th>
                                <th className="table-th text-center">Cantidad</th>
                                <th className="table-th text-right">Costo Unit.</th>
                                <th className="table-th">Referencia</th>
                                <th className="table-th">Observación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="py-4">
                                    <EmptyState icon={ArrowRightLeft} title="Sin movimientos" description="Registra el primer movimiento de inventario" />
                                </td></tr>
                            ) : filtered.map(m => {
                                const prod = products.find(p => p.id === m.product_id);
                                const wh = warehouses.find(w => w.id === m.warehouse_id);
                                return (
                                    <tr key={m.id} className="table-row">
                                        <td className="table-td text-gray-500 whitespace-nowrap">{formatDate(m.fecha)}</td>
                                        <td className="table-td"><Badge label={m.tipo} /></td>
                                        <td className="table-td">
                                            <p className="font-medium text-gray-900">{prod?.nombre ?? '—'}</p>
                                            <p className="text-xs font-mono text-gray-400">{prod?.sku}</p>
                                        </td>
                                        <td className="table-td text-gray-600 text-sm">{wh?.nombre ?? '—'}</td>
                                        <td className="table-td text-center">
                                            <span className={`font-bold ${m.tipo === 'ENTRADA' || m.tipo === 'AJUSTE' ? 'text-emerald-600' : m.tipo === 'SALIDA' ? 'text-red-600' : 'text-blue-600'}`}>
                                                {m.tipo === 'SALIDA' ? '-' : '+'}{m.cantidad}
                                            </span>
                                        </td>
                                        <td className="table-td text-right text-gray-600">
                                            {m.costo_unitario ? `L ${Number(m.costo_unitario).toLocaleString('es-HN', { minimumFractionDigits: 2 })}` : '—'}
                                        </td>
                                        <td className="table-td text-gray-600 text-sm">{m.referencia || '—'}</td>
                                        <td className="table-td text-gray-400 text-sm max-w-xs truncate">{m.observacion || '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <FloatingActionButton onClick={openCreate} label="Nuevo Movimiento" />

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Registrar Movimiento de Inventario"
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                        <button className="btn-primary" onClick={handleSave}>Guardar Movimiento</button>
                    </>
                }
            >
                <div className="space-y-4">
                    {stockError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertTriangle size={16} className="shrink-0" />
                            {stockError}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Fecha</label>
                            <input className="input" type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Tipo</label>
                            <select className="input" value={form.tipo} onChange={e => { set('tipo', e.target.value); setStockError(''); }}>
                                {TIPOS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Producto</label>
                        <select className="input" value={form.product_id} onChange={e => set('product_id', e.target.value)}>
                            {products.map(p => <option key={p.id} value={p.id}>{p.sku} – {p.nombre}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">{form.tipo === 'TRANSFERENCIA' ? 'Almacén Origen' : 'Almacén'}</label>
                            <select className="input" value={form.warehouse_id} onChange={e => set('warehouse_id', e.target.value)}>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.nombre}</option>)}
                            </select>
                            {(form.tipo === 'SALIDA' || form.tipo === 'TRANSFERENCIA') && form.product_id && form.warehouse_id && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Disponible: <span className="font-bold text-gray-700">{getAvailable(form.product_id, form.warehouse_id)}</span>
                                </p>
                            )}
                        </div>
                        {form.tipo === 'TRANSFERENCIA' && (
                            <div>
                                <label className="label">Almacén Destino</label>
                                <select className="input" value={form.warehouse_destino_id} onChange={e => set('warehouse_destino_id', e.target.value)}>
                                    <option value="">Seleccionar...</option>
                                    {warehouses.filter(w => w.id !== form.warehouse_id).map(w => <option key={w.id} value={w.id}>{w.nombre}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Cantidad</label>
                            <input className="input" type="number" value={form.cantidad} onChange={e => { set('cantidad', e.target.value); setStockError(''); }} min={0.01} step={0.01} placeholder="0" />
                        </div>
                        <div>
                            <label className="label">Costo Unitario (L)</label>
                            <input className="input" type="number" value={form.costo_unitario} onChange={e => set('costo_unitario', e.target.value)} min={0} step={0.01} placeholder="0.00" />
                        </div>
                    </div>
                    <div>
                        <label className="label">Referencia</label>
                        <input className="input" value={form.referencia} onChange={e => set('referencia', e.target.value)} placeholder="OC-000001, AJ-INV-001..." />
                    </div>
                    <div>
                        <label className="label">Observación</label>
                        <textarea className="input resize-none" rows={2} value={form.observacion} onChange={e => set('observacion', e.target.value)} placeholder="Observaciones del movimiento..." />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
