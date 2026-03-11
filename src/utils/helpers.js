/**
 * Format number as currency (HNL default)
 */
export function formatCurrency(value, currency = 'HNL') {
    return new Intl.NumberFormat('es-HN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(value ?? 0);
}

/**
 * Format date string to DD/MM/YYYY
 */
export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Generate next document number
 * e.g. getNextDocNumber(['OV-000001','OV-000002'], 'OV') => 'OV-000003'
 */
export function getNextDocNumber(existingDocs, prefix) {
    if (!existingDocs || existingDocs.length === 0) return `${prefix}-000001`;
    const numbers = existingDocs
        .map(d => parseInt(d.replace(`${prefix}-`, ''), 10))
        .filter(n => !isNaN(n));
    const max = Math.max(...numbers, 0);
    return `${prefix}-${String(max + 1).padStart(6, '0')}`;
}

/**
 * Calculate line totals for offer/quote line
 */
export function calcLineTotal({ cantidad, precio_unitario, descuento_pct, impuesto_pct, costo_unitario }) {
    const qty = parseFloat(cantidad) || 0;
    const price = parseFloat(precio_unitario ?? costo_unitario) || 0;
    const disc = parseFloat(descuento_pct) || 0;
    const tax = parseFloat(impuesto_pct) || 0;
    const subtotal = qty * price;
    const descuento = subtotal * (disc / 100);
    const base = subtotal - descuento;
    const impuesto = base * (tax / 100);
    const total = base + impuesto;
    return { subtotal, descuento, impuesto, total };
}

/**
 * Calculate document totals from lines
 */
export function calcDocTotals(lineas, type = 'sale') {
    let subtotal = 0;
    let totalDescuento = 0;
    let totalImpuesto = 0;
    let totalGeneral = 0;

    lineas.forEach(l => {
        const t = calcLineTotal(
            type === 'sale'
                ? { cantidad: l.cantidad, precio_unitario: l.precio_unitario, descuento_pct: l.descuento_pct, impuesto_pct: l.impuesto_pct }
                : { cantidad: l.cantidad, costo_unitario: l.costo_unitario, descuento_pct: 0, impuesto_pct: l.impuesto_pct }
        );
        subtotal += t.subtotal;
        totalDescuento += t.descuento;
        totalImpuesto += t.impuesto;
        totalGeneral += t.total;
    });

    return { subtotal, totalDescuento, totalImpuesto, totalGeneral };
}

/**
 * Generate a random UUID-like id
 */
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Get stock status label and color
 */
export function getStockStatus(available, stockMinimo = 0) {
    if (available <= 0) return { label: 'Sin stock', color: 'red' };
    if (available <= stockMinimo) return { label: 'Bajo', color: 'yellow' };
    return { label: 'OK', color: 'green' };
}

/**
 * Get total for all document lines
 */
export function getDocumentTotal(lineas, type = 'sale') {
    const { totalGeneral } = calcDocTotals(lineas, type);
    return totalGeneral;
}
