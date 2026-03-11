import React from 'react';

const variants = {
    Borrador: 'bg-gray-100 text-gray-600 ring-gray-300',
    Enviada: 'bg-blue-50 text-blue-700 ring-blue-200',
    Aprobada: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Cancelada: 'bg-red-50 text-red-700 ring-red-200',
    Convertida: 'bg-purple-50 text-purple-700 ring-purple-200',
    CLIENTE: 'bg-sky-50 text-sky-700 ring-sky-200',
    PROVEEDOR: 'bg-amber-50 text-amber-700 ring-amber-200',
    AMBOS: 'bg-violet-50 text-violet-700 ring-violet-200',
    Activo: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Inactivo: 'bg-gray-100 text-gray-500 ring-gray-200',
    OK: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Bajo: 'bg-amber-50 text-amber-700 ring-amber-200',
    'Sin stock': 'bg-red-50 text-red-700 ring-red-200',
    ENTRADA: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    SALIDA: 'bg-red-100 text-red-700 ring-red-200',
    AJUSTE: 'bg-blue-100 text-blue-700 ring-blue-200',
    TRANSFERENCIA: 'bg-purple-100 text-purple-700 ring-purple-200',
};

export default function Badge({ label, className = '' }) {
    const cls = variants[label] ?? 'bg-gray-100 text-gray-600 ring-gray-300';
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${cls} ${className}`}>
            {label}
        </span>
    );
}
