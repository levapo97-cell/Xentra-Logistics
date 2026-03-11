import React, { useState, useMemo } from 'react';
import { Hash, Plus, Pencil, CheckCircle, XCircle, ArrowRight, AlertTriangle, Eye, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

// ─── Catalog of all document types in the system ───────────────────────────
const DOCUMENT_TYPES = [
    { value: 'Oferta de Venta',          label: 'Oferta de Venta',          module: 'Ventas',        icon: '📋', defaultPrefix: 'OV-' },
    { value: 'Orden de Venta',           label: 'Orden de Venta',           module: 'Ventas',        icon: '📦', defaultPrefix: 'SOV-' },
    { value: 'Factura Cliente',          label: 'Factura Cliente',          module: 'Ventas',        icon: '🧾', defaultPrefix: 'FC-' },
    { value: 'Cotización de Compra',     label: 'Cotización de Compra',     module: 'Compras',       icon: '📋', defaultPrefix: 'CQ-' },
    { value: 'Orden de Compra',          label: 'Orden de Compra',          module: 'Compras',       icon: '🛒', defaultPrefix: 'OCO-' },
    { value: 'Factura Proveedor',        label: 'Factura Proveedor',        module: 'Compras',       icon: '📄', defaultPrefix: 'FP-' },
    { value: 'Pago / Cobro',             label: 'Pago / Cobro',             module: 'Finanzas',      icon: '💳', defaultPrefix: 'PAY-' },
    { value: 'Gasto',                    label: 'Gasto Operativo',          module: 'Gastos',        icon: '💸', defaultPrefix: 'EXP-' },
    { value: 'Movimiento de Inventario', label: 'Movimiento de Inventario', module: 'Inventario',    icon: '🔄', defaultPrefix: 'MOV-' },
];

const MODULE_COLORS = {
    'Ventas':     { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
    'Compras':    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    'Finanzas':   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
    'Gastos':     { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
    'Inventario': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
};

function formatDocNumber(prefix, num, padLen = 6) {
    return `${prefix}${String(num).padStart(padLen, '0')}`;
}

// ─── Range Form ─────────────────────────────────────────────────────────────
function NumberingRangeForm({ initial, existingRanges, onSave, onClose }) {
    const isEdit = !!initial;
    const [form, setForm] = useState(() => initial
        ? { ...initial }
        : { document: '', prefix: '', start: 1, end: 999999, current: 1, active: true, description: '', año: new Date().getFullYear() }
    );
    const [previewOpen, setPreviewOpen] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const docInfo = DOCUMENT_TYPES.find(d => d.value === form.document);

    // Auto-fill prefix when document type is selected
    const handleDocChange = (val) => {
        const dt = DOCUMENT_TYPES.find(d => d.value === val);
        set('document', val);
        if (dt && !isEdit) {
            set('prefix', dt.defaultPrefix);
        }
    };

    // Detect duplicate active range for same doc
    const hasDuplicate = !isEdit && form.document && existingRanges.some(
        r => r.document === form.document && r.active && r.id !== initial?.id
    );

    const isValid = form.document && form.prefix && form.start >= 1 && form.end > form.start && form.current >= form.start;

    const nextPreview = formatDocNumber(form.prefix, form.current);
    const usedPct = form.start < form.end
        ? Math.round(((form.current - form.start) / (form.end - form.start)) * 100)
        : 0;

    return (
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
            {/* Document Type Selection */}
            <div>
                <label className="label">Tipo de Documento *</label>
                <div className="relative">
                    <select
                        className="input pr-8 appearance-none"
                        value={form.document}
                        disabled={isEdit}
                        onChange={e => handleDocChange(e.target.value)}
                    >
                        <option value="">-- Seleccionar tipo de documento --</option>
                        {Object.entries(
                            DOCUMENT_TYPES.reduce((acc, dt) => {
                                if (!acc[dt.module]) acc[dt.module] = [];
                                acc[dt.module].push(dt);
                                return acc;
                            }, {})
                        ).map(([module, types]) => (
                            <optgroup key={module} label={`── ${module} ──`}>
                                {types.map(dt => (
                                    <option key={dt.value} value={dt.value}>
                                        {dt.icon} {dt.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-3.5 text-gray-400 pointer-events-none" />
                </div>
                {docInfo && (
                    <div className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${MODULE_COLORS[docInfo.module]?.bg} ${MODULE_COLORS[docInfo.module]?.text} ${MODULE_COLORS[docInfo.module]?.border}`}>
                        <span className={`w-2 h-2 rounded-full ${MODULE_COLORS[docInfo.module]?.dot}`} />
                        Módulo: <span className="font-bold">{docInfo.module}</span>
                    </div>
                )}
                {hasDuplicate && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                        <AlertTriangle size={13} className="shrink-0" />
                        Ya existe un rango <strong>activo</strong> para este documento. Si creas otro, desactiva el anterior.
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="label">Descripción (opcional)</label>
                <input className="input" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="ej. Rango fiscal 2026" />
            </div>

            {/* Prefix + Year */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Prefijo *</label>
                    <input className="input font-mono" value={form.prefix} onChange={e => set('prefix', e.target.value.toUpperCase())} placeholder="FC-" />
                    <p className="text-xs text-gray-400 mt-1">Letras y guiones. Ej: FC-, OV-2026-</p>
                </div>
                <div>
                    <label className="label">Año Fiscal</label>
                    <input type="number" className="input" value={form.año || new Date().getFullYear()} onChange={e => set('año', parseInt(e.target.value))} min={2020} max={2099} />
                </div>
            </div>

            {/* Rango numérico */}
            <div>
                <label className="label">Rango Numérico</label>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Desde</p>
                        <input type="number" className="input text-center font-mono" value={form.start} onChange={e => set('start', parseInt(e.target.value) || 1)} min={1} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Hasta</p>
                        <input type="number" className="input text-center font-mono" value={form.end} onChange={e => set('end', parseInt(e.target.value) || 999999)} min={1} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Próximo</p>
                        <input type="number" className="input text-center font-mono bg-brand-50 text-brand-700 font-bold" value={form.current} onChange={e => set('current', parseInt(e.target.value) || 1)} min={1} />
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Capacidad total: {(form.end - form.start + 1).toLocaleString()} documentos</p>
            </div>

            {/* Preview */}
            {form.prefix && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Vista Previa del Número</p>
                        <button type="button" onClick={() => setPreviewOpen(v => !v)} className="text-xs text-brand-600 flex items-center gap-1"><Eye size={12} /> {previewOpen ? 'Ocultar' : 'Ver más'}</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white border-2 border-brand-300 rounded-lg px-4 py-3 text-center">
                            <p className="text-xs text-gray-400 mb-0.5">Próximo documento</p>
                            <p className="text-xl font-bold font-mono text-brand-700">{nextPreview}</p>
                        </div>
                        <ArrowRight size={16} className="text-gray-400" />
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
                            <p className="text-xs text-gray-400 mb-0.5">Último disponible</p>
                            <p className="text-xl font-bold font-mono text-gray-500">{formatDocNumber(form.prefix, form.end)}</p>
                        </div>
                    </div>
                    {previewOpen && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">Primeros 5 números del rango:</p>
                            <div className="flex flex-wrap gap-2">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <span key={i} className={`px-2 py-1 rounded-md font-mono text-xs font-medium border ${i === 0 ? 'bg-brand-100 text-brand-700 border-brand-300' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                        {formatDocNumber(form.prefix, form.start + i)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Uso del rango</span>
                            <span className={`font-bold ${usedPct > 80 ? 'text-red-600' : usedPct > 50 ? 'text-amber-600' : 'text-green-600'}`}>{usedPct}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-2 rounded-full transition-all ${usedPct > 80 ? 'bg-red-500' : usedPct > 50 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.max(usedPct, 2)}%` }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Estado */}
            <div className="flex items-center gap-3 py-1">
                <button
                    type="button"
                    onClick={() => set('active', !form.active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${form.active ? 'bg-brand-600' : 'bg-gray-300'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <div>
                    <p className={`text-sm font-medium ${form.active ? 'text-brand-700' : 'text-gray-500'}`}>
                        {form.active ? 'Rango Activo' : 'Rango Inactivo'}
                    </p>
                    <p className="text-xs text-gray-400">{form.active ? 'Este rango se usará al crear documentos' : 'No se asignará en nuevos documentos'}</p>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button
                    className="btn-primary"
                    disabled={!isValid}
                    onClick={() => { onSave(form); onClose(); }}
                >
                    <CheckCircle size={15} />
                    {isEdit ? 'Actualizar Rango' : 'Crear Rango'}
                </button>
            </div>
        </div>
    );
}

// ─── Detail / Usage Card ─────────────────────────────────────────────────────
function RangeCard({ r, onEdit }) {
    const docInfo = DOCUMENT_TYPES.find(d => d.value === r.document) || { module: 'General', icon: '📋' };
    const colors = MODULE_COLORS[docInfo.module] || MODULE_COLORS['Inventario'];
    const usedPct = r.start < r.end
        ? Math.min(100, Math.round(((r.current - r.start) / (r.end - r.start)) * 100))
        : 0;
    const remaining = r.end - r.current + 1;
    const isLow = usedPct > 80;

    return (
        <div className={`bg-white rounded-xl border ${r.active ? 'border-gray-200' : 'border-gray-100 opacity-70'} shadow-sm overflow-hidden hover:shadow-md transition-shadow`}>
            {/* Header */}
            <div className={`px-4 py-3 flex items-center justify-between ${colors.bg} border-b ${colors.border}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{docInfo.icon}</span>
                    <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${colors.text}`}>{r.document}</p>
                        <p className="text-xs text-gray-500">{docInfo.module}{r.description ? ` · ${r.description}` : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {r.active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {r.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button onClick={() => onEdit(r)} className="p-1.5 rounded-lg hover:bg-white/60 text-gray-500 transition-colors">
                        <Pencil size={13} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3">
                {/* Number preview */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 text-center bg-gray-50 border border-gray-200 rounded-lg py-2">
                        <p className="text-xs text-gray-400">Próximo N°</p>
                        <p className="font-mono font-bold text-brand-700 text-base">{formatDocNumber(r.prefix, r.current)}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300" />
                    <div className="flex-1 text-center bg-gray-50 border border-gray-200 rounded-lg py-2">
                        <p className="text-xs text-gray-400">Último</p>
                        <p className="font-mono text-gray-500 text-sm">{formatDocNumber(r.prefix, r.end)}</p>
                    </div>
                </div>

                {/* Usage bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Uso: {usedPct}%</span>
                        <span className={isLow ? 'text-red-600 font-semibold' : ''}>{remaining.toLocaleString()} disponibles</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all ${isLow ? 'bg-red-500' : usedPct > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.max(usedPct, 2)}%` }}
                        />
                    </div>
                    {isLow && (
                        <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={10} /> Rango próximo a agotarse</p>
                    )}
                </div>

                {/* Footer meta */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                    <span>Rango: {r.start.toLocaleString()} – {r.end.toLocaleString()}</span>
                    {r.año && <span>Año {r.año}</span>}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function NumberingRanges() {
    const { numberingRanges, addNumberingRange, updateNumberingRange } = useApp();
    const [search, setSearch] = useState('');
    const [filterModule, setFilterModule] = useState('Todos');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const modules = ['Todos', ...new Set(DOCUMENT_TYPES.map(d => d.module))];

    const filtered = useMemo(() => {
        return numberingRanges.filter(r => {
            const docInfo = DOCUMENT_TYPES.find(d => d.value === r.document);
            const matchSearch = r.document.toLowerCase().includes(search.toLowerCase()) || r.prefix.toLowerCase().includes(search.toLowerCase());
            const matchModule = filterModule === 'Todos' || docInfo?.module === filterModule;
            return matchSearch && matchModule;
        });
    }, [numberingRanges, search, filterModule]);

    const handleSave = (data) => {
        if (editing) updateNumberingRange(editing.id, data);
        else addNumberingRange(data);
        setEditing(null);
    };

    const openEdit = (r) => { setEditing(r); setModalOpen(true); };
    const openNew = () => { setEditing(null); setModalOpen(true); };

    // Stats
    const activeCount = numberingRanges.filter(r => r.active).length;
    const alertCount = numberingRanges.filter(r => {
        const pct = r.start < r.end ? Math.round(((r.current - r.start) / (r.end - r.start)) * 100) : 0;
        return pct > 80 && r.active;
    }).length;

    return (
        <div className="space-y-5">
            {/* KPI strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="card p-4 bg-brand-50">
                    <p className="text-xs text-gray-500">Total Rangos</p>
                    <p className="text-2xl font-bold text-brand-700">{numberingRanges.length}</p>
                </div>
                <div className="card p-4 bg-green-50">
                    <p className="text-xs text-gray-500">Activos</p>
                    <p className="text-2xl font-bold text-green-700">{activeCount}</p>
                </div>
                <div className="card p-4 bg-gray-50">
                    <p className="text-xs text-gray-500">Inactivos</p>
                    <p className="text-2xl font-bold text-gray-600">{numberingRanges.length - activeCount}</p>
                </div>
                <div className={`card p-4 ${alertCount > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500">Alertas de capacidad</p>
                    <p className={`text-2xl font-bold ${alertCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>{alertCount}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="card p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px]">
                    <Hash size={14} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                    <input
                        className="input pl-8"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar documento o prefijo..."
                    />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {modules.map(m => (
                        <button
                            key={m}
                            onClick={() => setFilterModule(m)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filterModule === m
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
                <button className="btn-primary ml-auto shrink-0" onClick={openNew}>
                    <Plus size={16} /> Nuevo Rango
                </button>
            </div>

            {/* Cards Grid */}
            {filtered.length === 0 ? (
                <div className="card">
                    <EmptyState icon={Hash} title="No hay rangos de numeración" description="Crea el primer rango y asócialo a un tipo de documento." />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(r => <RangeCard key={r.id} r={r} onEdit={openEdit} />)}
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
                title={editing ? `Editar: ${editing.document}` : 'Nuevo Rango de Numeración'}
                size="lg"
            >
                <NumberingRangeForm
                    initial={editing}
                    existingRanges={numberingRanges}
                    onSave={handleSave}
                    onClose={() => { setModalOpen(false); setEditing(null); }}
                />
            </Modal>
        </div>
    );
}
