import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Send, CheckCircle, XCircle, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/Badge';
import { formatCurrency, getNextDocNumber, calcLineTotal, calcDocTotals, generateId } from '../utils/helpers';

const ESTADOS = ['Borrador', 'Enviada', 'Aprobada', 'Cancelada'];

const emptyLine = () => ({
    id: generateId('ovl'),
    producto_id: '',
    descripcion: '',
    cantidad: 1,
    precio_unitario: 0,
    descuento_pct: 0,
    impuesto_pct: 15,
});

export default function SalesOfferForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { salesOffers, addSalesOffer, updateSalesOffer, businessPartners, products, warehouses, stock } = useApp();

    const isNew = !id || id === 'nueva';
    const existing = salesOffers.find(o => o.id === id);

    const [form, setForm] = useState(() => {
        if (!isNew && existing) return { ...existing, lineas: existing.lineas.map(l => ({ ...l })) };
        return {
            numero_documento: getNextDocNumber(salesOffers.map(o => o.numero_documento), 'OV'),
            fecha: new Date().toISOString().split('T')[0],
            cliente_id: '',
            vendedor: '',
            almacen_id: warehouses[0]?.id ?? '',
            estado: 'Borrador',
            observaciones: '',
            lineas: [emptyLine()],
        };
    });

    const readOnly = form.estado === 'Cancelada';
    const totals = calcDocTotals(form.lineas, 'sale');

    const setField = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const setLine = (lineId, field, value) => {
        setForm(f => ({
            ...f,
            lineas: f.lineas.map(l => {
                if (l.id !== lineId) return l;
                const updated = { ...l, [field]: value };
                if (field === 'producto_id') {
                    const prod = products.find(p => p.id === value);
                    updated.descripcion = prod?.nombre ?? '';
                    updated.precio_unitario = prod?.precio_venta ?? 0;
                    updated.impuesto_pct = prod?.impuesto_pct ?? 15;
                }
                return updated;
            }),
        }));
    };

    const addLine = () => setForm(f => ({ ...f, lineas: [...f.lineas, emptyLine()] }));
    const removeLine = (lineId) => setForm(f => ({ ...f, lineas: f.lineas.filter(l => l.id !== lineId) }));

    const getAvailable = (productId) => {
        if (!productId || !form.almacen_id) return null;
        const s = stock.find(s => s.product_id === productId && s.warehouse_id === form.almacen_id);
        return s ? s.on_hand - s.reserved : 0;
    };

    const handleSave = (newEstado) => {
        const data = { ...form };
        if (newEstado) data.estado = newEstado;
        if (isNew) {
            const created = addSalesOffer(data);
            navigate(`/ventas/ofertas/${created.id}`);
        } else {
            updateSalesOffer(id, data);
            if (newEstado) setField('estado', newEstado);
        }
    };

    const clientes = businessPartners.filter(bp => bp.tipo === 'CLIENTE' || bp.tipo === 'AMBOS');

    return (
        <div className="space-y-5 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3">
                <Link to="/ventas/ofertas" className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div className="flex-1">
                    <h2 className="page-title">{isNew ? 'Nueva Oferta de Venta' : form.numero_documento}</h2>
                </div>
                <Badge label={form.estado} />
            </div>

            {/* Header section */}
            <div className="card">
                <h3 className="section-title">Encabezado</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="label">N° Documento</label>
                        <input className="input bg-gray-50 font-mono" value={form.numero_documento} readOnly />
                    </div>
                    <div>
                        <label className="label">Fecha</label>
                        <input className="input" type="date" disabled={readOnly} value={form.fecha} onChange={e => setField('fecha', e.target.value)} />
                    </div>
                    <div>
                        <label className="label">Estado</label>
                        <select className="input" disabled={readOnly} value={form.estado} onChange={e => setField('estado', e.target.value)}>
                            {ESTADOS.map(e => <option key={e}>{e}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Cliente *</label>
                        <select className="input" disabled={readOnly} value={form.cliente_id} onChange={e => setField('cliente_id', e.target.value)}>
                            <option value="">Seleccionar cliente...</option>
                            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre_comercial}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Vendedor</label>
                        <input className="input" disabled={readOnly} value={form.vendedor} onChange={e => setField('vendedor', e.target.value)} placeholder="Nombre del vendedor" />
                    </div>
                    <div>
                        <label className="label">Almacén</label>
                        <select className="input" disabled={readOnly} value={form.almacen_id} onChange={e => setField('almacen_id', e.target.value)}>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.nombre}</option>)}
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <label className="label">Observaciones</label>
                    <textarea className="input resize-none" rows={2} disabled={readOnly} value={form.observaciones} onChange={e => setField('observaciones', e.target.value)} placeholder="Condiciones especiales, notas..." />
                </div>
            </div>

            {/* Lines */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="section-title mb-0">Líneas de Detalle</h3>
                    {!readOnly && (
                        <button className="btn-secondary btn-sm" onClick={addLine}><Plus size={14} /> Agregar Línea</button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="pb-2 text-left text-xs font-semibold text-gray-500 pr-3">Producto</th>
                                <th className="pb-2 text-left text-xs font-semibold text-gray-500 w-12">Disp.</th>
                                <th className="pb-2 text-center text-xs font-semibold text-gray-500 w-20">Cantidad</th>
                                <th className="pb-2 text-right text-xs font-semibold text-gray-500 w-28">Precio Unit.</th>
                                <th className="pb-2 text-center text-xs font-semibold text-gray-500 w-20">Desc %</th>
                                <th className="pb-2 text-center text-xs font-semibold text-gray-500 w-20">ISV %</th>
                                <th className="pb-2 text-right text-xs font-semibold text-gray-500 w-32">Total Línea</th>
                                {!readOnly && <th className="pb-2 w-8"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {form.lineas.map((line) => {
                                const t = calcLineTotal({ cantidad: line.cantidad, precio_unitario: line.precio_unitario, descuento_pct: line.descuento_pct, impuesto_pct: line.impuesto_pct });
                                const avail = getAvailable(line.producto_id);
                                return (
                                    <tr key={line.id} className="group">
                                        <td className="py-2 pr-3">
                                            {readOnly ? (
                                                <p className="text-gray-800">{line.descripcion || '—'}</p>
                                            ) : (
                                                <select className="input text-sm py-1.5" value={line.producto_id} onChange={e => setLine(line.id, 'producto_id', e.target.value)}>
                                                    <option value="">Seleccionar...</option>
                                                    {products.filter(p => p.activo).map(p => <option key={p.id} value={p.id}>{p.sku} – {p.nombre}</option>)}
                                                </select>
                                            )}
                                        </td>
                                        <td className="py-2 text-center">
                                            {avail !== null ? (
                                                <span className={`text-xs font-bold ${avail <= 0 ? 'text-red-500' : avail <= 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                    {avail}
                                                </span>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="py-2 px-2">
                                            <input type="number" className="input text-center text-sm py-1.5" disabled={readOnly} value={line.cantidad} onChange={e => setLine(line.id, 'cantidad', e.target.value)} min={0.01} step={0.01} />
                                        </td>
                                        <td className="py-2 px-2">
                                            <input type="number" className="input text-right text-sm py-1.5" disabled={readOnly} value={line.precio_unitario} onChange={e => setLine(line.id, 'precio_unitario', e.target.value)} min={0} step={0.01} />
                                        </td>
                                        <td className="py-2 px-2">
                                            <input type="number" className="input text-center text-sm py-1.5" disabled={readOnly} value={line.descuento_pct} onChange={e => setLine(line.id, 'descuento_pct', e.target.value)} min={0} max={100} />
                                        </td>
                                        <td className="py-2 px-2">
                                            <input type="number" className="input text-center text-sm py-1.5" disabled={readOnly} value={line.impuesto_pct} onChange={e => setLine(line.id, 'impuesto_pct', e.target.value)} min={0} max={100} />
                                        </td>
                                        <td className="py-2 pl-2 text-right font-semibold text-gray-900">{formatCurrency(t.total)}</td>
                                        {!readOnly && (
                                            <td className="py-2 pl-2">
                                                <button onClick={() => removeLine(line.id)} className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <div className="w-72 space-y-1.5 text-sm">
                        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
                        <div className="flex justify-between text-amber-600"><span>(-) Descuentos</span><span>-{formatCurrency(totals.totalDescuento)}</span></div>
                        <div className="flex justify-between text-gray-500"><span>(+) ISV</span><span>{formatCurrency(totals.totalImpuesto)}</span></div>
                        <div className="flex justify-between font-bold text-base text-gray-900 pt-1.5 border-t border-gray-200">
                            <span>TOTAL GENERAL</span>
                            <span className="text-brand-700">{formatCurrency(totals.totalGeneral)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {!readOnly && (
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                    <Link to="/ventas/ofertas" className="btn-secondary"><ArrowLeft size={16} /> Volver</Link>
                    <div className="flex gap-2">
                        <button className="btn-secondary" onClick={() => handleSave()}><Save size={16} /> Guardar</button>
                        {form.estado === 'Borrador' && (
                            <button className="btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm" onClick={() => handleSave('Enviada')}><Send size={16} /> Enviar</button>
                        )}
                        {form.estado === 'Enviada' && (
                            <button className="btn-success" onClick={() => handleSave('Aprobada')}><CheckCircle size={16} /> Aprobar</button>
                        )}
                        <button className="btn-danger" onClick={() => handleSave('Cancelada')}><XCircle size={16} /> Cancelar</button>
                    </div>
                </div>
            )}
            {readOnly && (
                <div className="flex pb-4">
                    <Link to="/ventas/ofertas" className="btn-secondary"><ArrowLeft size={16} /> Volver al Listado</Link>
                </div>
            )}
        </div>
    );
}
