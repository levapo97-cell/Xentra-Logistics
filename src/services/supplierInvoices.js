export const supplierInvoices = [
    {
        id: 'fp-001',
        numero_documento: 'FP-000001',
        num_factura_proveedor: 'FAC-2026-00145',
        orden_ref: 'OCO-000001',
        fecha: '2026-02-25',
        fecha_vencimiento: '2026-03-12',
        proveedor_id: 'bp-002',
        moneda: 'HNL',
        estado: 'Pagada',
        observaciones: '',
        lineas: [
            { id: 'fpl-001', producto_id: 'prod-002', descripcion: 'Caja Cartón Triple Canal 60x40', cantidad: 300, costo_unitario: 28.00, impuesto_pct: 15 },
        ],
    },
    {
        id: 'fp-002',
        numero_documento: 'FP-000002',
        num_factura_proveedor: 'SRV-0892',
        orden_ref: 'OCO-000002',
        fecha: '2026-03-04',
        fecha_vencimiento: '2026-03-19',
        proveedor_id: 'bp-003',
        moneda: 'USD',
        estado: 'Pendiente',
        observaciones: 'Falta recibir totalidad del pedido',
        lineas: [
            { id: 'fpl-002', producto_id: 'prod-003', descripcion: 'Aceite Hidráulico ISO 46 – 20L', cantidad: 20, costo_unitario: 980.00, impuesto_pct: 15 },
        ],
    },
];
