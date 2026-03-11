import React, { createContext, useContext, useState, useCallback } from 'react';
import { businessPartners as initialBP } from '../services/businessPartners';
import { products as initialProducts } from '../services/products';
import { warehouses as initialWarehouses } from '../services/warehouses';
import { stockByWarehouse as initialStock } from '../services/stock';
import { inventoryMovements as initialMovements } from '../services/inventoryMovements';
import { salesOffers as initialOffers } from '../services/salesOffers';
import { purchaseQuotes as initialQuotes } from '../services/purchaseQuotes';
import { salesOrders as initialSalesOrders } from '../services/salesOrders';
import { customerInvoices as initialCustomerInvoices } from '../services/customerInvoices';
import { purchaseOrders as initialPurchaseOrders } from '../services/purchaseOrders';
import { supplierInvoices as initialSupplierInvoices } from '../services/supplierInvoices';
import { chartOfAccounts as initialChartOfAccounts } from '../services/chartOfAccounts';
import { payments as initialPayments } from '../services/payments';
import { expenses as initialExpenses } from '../services/expenses';
import { departments as initialDepartments } from '../services/departments';
import { expenseCategories as initialCategories } from '../services/categories';
import { expenseSubcategories as initialSubcategories } from '../services/subcategories';
import { divisions as initialDivisions } from '../services/divisions';
import { roles as initialRoles } from '../services/roles';
import { numberingRanges as initialNumberingRanges } from '../services/numberingRanges';
import { generateId } from '../utils/helpers';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [businessPartners, setBusinessPartners] = useState(initialBP);
    const [products, setProducts] = useState(initialProducts);
    const [warehouses, setWarehouses] = useState(initialWarehouses);
    const [stock, setStock] = useState(initialStock);
    const [movements, setMovements] = useState(initialMovements);
    const [salesOffers, setSalesOffers] = useState(initialOffers);
    const [purchaseQuotes, setPurchaseQuotes] = useState(initialQuotes);
    const [salesOrders, setSalesOrders] = useState(initialSalesOrders);
    const [customerInvoices, setCustomerInvoices] = useState(initialCustomerInvoices);
    const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
    const [supplierInvoices, setSupplierInvoices] = useState(initialSupplierInvoices);
    const [chartOfAccounts, setChartOfAccounts] = useState(initialChartOfAccounts);
    const [payments, setPayments] = useState(initialPayments);
    const [expenses, setExpenses] = useState(initialExpenses);
    const [departments, setDepartments] = useState(initialDepartments);
    const [expenseCategories, setExpenseCategories] = useState(initialCategories);
    const [expenseSubcategories, setExpenseSubcategories] = useState(initialSubcategories);
    const [divisions, setDivisions] = useState(initialDivisions);
    const [roles, setRoles] = useState(initialRoles);
    const [numberingRanges, setNumberingRanges] = useState(initialNumberingRanges);

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });

    const login = useCallback((user, pass) => {
        if (user === 'admin' && pass === 'admin') {
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true');
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
    }, []);

    // ─── Numbering Range Helper ───────────────────────────────────────
    // Consumes the next number from the matching range and returns the full doc ref.
    // docType matches the 'document' field in numberingRanges (e.g. 'Oferta de Venta')
    const getNextDocRef = useCallback((docType) => {
        let ref = null;
        setNumberingRanges(prev => {
            const idx = prev.findIndex(r => r.active && r.document === docType);
            if (idx === -1) return prev;
            const range = prev[idx];
            const num = range.current;
            ref = `${range.prefix}${String(num).padStart(6, '0')}`;
            const updated = [...prev];
            updated[idx] = { ...range, current: num + 1 };
            return updated;
        });
        return ref;
    }, []);

    // Preview next number without consuming it
    const peekNextDocRef = useCallback((docType, ranges) => {
        const range = ranges.find(r => r.active && r.document === docType);
        if (!range) return null;
        return `${range.prefix}${String(range.current).padStart(6, '0')}`;
    }, []);

    // ─── Business Partners ────────────────────────────────────────────
    const addBusinessPartner = useCallback((data) => {
        const newBP = { ...data, id: generateId('bp') };
        setBusinessPartners(prev => [...prev, newBP]);
        return newBP;
    }, []);

    const updateBusinessPartner = useCallback((id, data) => {
        setBusinessPartners(prev => prev.map(bp => bp.id === id ? { ...bp, ...data } : bp));
    }, []);

    const deleteBusinessPartner = useCallback((id) => {
        setBusinessPartners(prev => prev.map(bp => bp.id === id ? { ...bp, estado: false } : bp));
    }, []);

    // ─── Products ────────────────────────────────────────────────────
    const addProduct = useCallback((data) => {
        const newProd = { ...data, id: generateId('prod') };
        setProducts(prev => [...prev, newProd]);
        return newProd;
    }, []);

    const updateProduct = useCallback((id, data) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    }, []);

    // ─── Warehouses ──────────────────────────────────────────────────
    const addWarehouse = useCallback((data) => {
        const newWH = { ...data, id: generateId('wh') };
        setWarehouses(prev => [...prev, newWH]);
        return newWH;
    }, []);

    const updateWarehouse = useCallback((id, data) => {
        setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
    }, []);

    // ─── Stock helpers ───────────────────────────────────────────────
    const getStock = useCallback((productId, warehouseId) => {
        return stock.find(s => s.product_id === productId && s.warehouse_id === warehouseId);
    }, [stock]);

    const updateStock = useCallback((productId, warehouseId, delta) => {
        setStock(prev => {
            const exists = prev.find(s => s.product_id === productId && s.warehouse_id === warehouseId);
            if (exists) {
                return prev.map(s =>
                    s.product_id === productId && s.warehouse_id === warehouseId
                        ? { ...s, on_hand: Math.max(0, s.on_hand + delta) }
                        : s
                );
            } else {
                return [...prev, { id: generateId('stk'), product_id: productId, warehouse_id: warehouseId, on_hand: Math.max(0, delta), reserved: 0 }];
            }
        });
    }, []);

    // ─── Inventory Movements ─────────────────────────────────────────
    const addMovement = useCallback((data) => {
        const newMov = { ...data, id: generateId('mov') };
        if (data.tipo === 'ENTRADA' || data.tipo === 'AJUSTE') {
            updateStock(data.product_id, data.warehouse_id, +data.cantidad);
        } else if (data.tipo === 'SALIDA') {
            updateStock(data.product_id, data.warehouse_id, -data.cantidad);
        } else if (data.tipo === 'TRANSFERENCIA') {
            const salida = { ...newMov, id: generateId('mov'), tipo: 'SALIDA', referencia: `${data.referencia} [SALIDA]` };
            const entrada = { ...newMov, id: generateId('mov'), tipo: 'ENTRADA', warehouse_id: data.warehouse_destino_id, referencia: `${data.referencia} [ENTRADA]` };
            setMovements(prev => [...prev, salida, entrada]);
            updateStock(data.product_id, data.warehouse_id, -data.cantidad);
            updateStock(data.product_id, data.warehouse_destino_id, +data.cantidad);
            return;
        }
        setMovements(prev => [...prev, newMov]);
    }, [updateStock]);

    // ─── Sales Offers ────────────────────────────────────────────────
    const addSalesOffer = useCallback((data) => {
        const newOffer = { ...data, id: generateId('ov') };
        setSalesOffers(prev => [...prev, newOffer]);
        return newOffer;
    }, []);

    const updateSalesOffer = useCallback((id, data) => {
        setSalesOffers(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
    }, []);

    // ─── Purchase Quotes ─────────────────────────────────────────────
    const addPurchaseQuote = useCallback((data) => {
        const newQuote = { ...data, id: generateId('cq') };
        setPurchaseQuotes(prev => [...prev, newQuote]);
        return newQuote;
    }, []);

    const updatePurchaseQuote = useCallback((id, data) => {
        setPurchaseQuotes(prev => prev.map(q => q.id === id ? { ...q, ...data } : q));
    }, []);

    // ─── Sales Orders ────────────────────────────────────────────────
    const addSalesOrder = useCallback((data) => {
        const newSO = { ...data, id: generateId('so') };
        setSalesOrders(prev => [...prev, newSO]);
        return newSO;
    }, []);

    const updateSalesOrder = useCallback((id, data) => {
        setSalesOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
    }, []);

    // ─── Customer Invoices ───────────────────────────────────────────
    const addCustomerInvoice = useCallback((data) => {
        const newFC = { ...data, id: generateId('fc') };
        setCustomerInvoices(prev => [...prev, newFC]);
        return newFC;
    }, []);

    const updateCustomerInvoice = useCallback((id, data) => {
        setCustomerInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    }, []);

    // ─── Purchase Orders ─────────────────────────────────────────────
    const addPurchaseOrder = useCallback((data) => {
        const newPO = { ...data, id: generateId('po') };
        setPurchaseOrders(prev => [...prev, newPO]);
        return newPO;
    }, []);

    const updatePurchaseOrder = useCallback((id, data) => {
        setPurchaseOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
    }, []);

    // ─── Supplier Invoices ───────────────────────────────────────────
    const addSupplierInvoice = useCallback((data) => {
        const newFP = { ...data, id: generateId('fp') };
        setSupplierInvoices(prev => [...prev, newFP]);
        return newFP;
    }, []);

    const updateSupplierInvoice = useCallback((id, data) => {
        setSupplierInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    }, []);

    // ─── Chart of Accounts ───────────────────────────────────────────
    const addAccount = useCallback((data) => {
        const newAcc = { ...data, id: generateId('acc') };
        setChartOfAccounts(prev => [...prev, newAcc]);
        return newAcc;
    }, []);

    const updateAccount = useCallback((id, data) => {
        setChartOfAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    }, []);

    const deleteAccount = useCallback((id) => {
        setChartOfAccounts(prev => prev.map(a => a.id === id ? { ...a, active: false } : a));
    }, []);

    // ─── Payments ────────────────────────────────────────────────────
    const addPayment = useCallback((data) => {
        const newPay = { ...data, id: generateId('pay') };
        setPayments(prev => [...prev, newPay]);
        return newPay;
    }, []);

    const updatePayment = useCallback((id, data) => {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    }, []);

    // ─── Expenses ────────────────────────────────────────────────────
    const addExpense = useCallback((data) => {
        const newExp = { ...data, id: generateId('exp') };
        setExpenses(prev => [...prev, newExp]);
        return newExp;
    }, []);

    const updateExpense = useCallback((id, data) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    }, []);

    const deleteExpense = useCallback((id) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    }, []);

    // ─── Departments ─────────────────────────────────────────────────
    const addDepartment = useCallback((data) => {
        const newDept = { ...data, id: generateId('dept') };
        setDepartments(prev => [...prev, newDept]);
        return newDept;
    }, []);

    const updateDepartment = useCallback((id, data) => {
        setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    }, []);

    // ─── Expense Categories ───────────────────────────────────────────
    const addExpenseCategory = useCallback((data) => {
        const newCat = { ...data, id: generateId('cat'), subCount: 0 };
        setExpenseCategories(prev => [...prev, newCat]);
        return newCat;
    }, []);

    const updateExpenseCategory = useCallback((id, data) => {
        setExpenseCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    }, []);

    // ─── Expense Subcategories ────────────────────────────────────────
    const addExpenseSubcategory = useCallback((data) => {
        const newSub = { ...data, id: generateId('sub') };
        setExpenseSubcategories(prev => [...prev, newSub]);
        return newSub;
    }, []);

    const updateExpenseSubcategory = useCallback((id, data) => {
        setExpenseSubcategories(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    }, []);

    // ─── Divisions ───────────────────────────────────────────────────
    const addDivision = useCallback((data) => {
        const newDiv = { ...data, id: generateId('div') };
        setDivisions(prev => [...prev, newDiv]);
        return newDiv;
    }, []);

    const updateDivision = useCallback((id, data) => {
        setDivisions(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    }, []);

    // ─── Roles ───────────────────────────────────────────────────────
    const addRole = useCallback((data) => {
        const newRole = { ...data, id: generateId('rol') };
        setRoles(prev => [...prev, newRole]);
        return newRole;
    }, []);

    const updateRole = useCallback((id, data) => {
        setRoles(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    }, []);

    // ─── Numbering Ranges ────────────────────────────────────────────
    const addNumberingRange = useCallback((data) => {
        const newNR = { ...data, id: generateId('nr') };
        setNumberingRanges(prev => [...prev, newNR]);
        return newNR;
    }, []);

    const updateNumberingRange = useCallback((id, data) => {
        setNumberingRanges(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    }, []);

    const value = {
        isAuthenticated, login, logout,
        // Numbering
        numberingRanges, addNumberingRange, updateNumberingRange, getNextDocRef, peekNextDocRef,
        // Business Partners
        businessPartners, addBusinessPartner, updateBusinessPartner, deleteBusinessPartner,
        // Products & Warehouses
        products, addProduct, updateProduct,
        warehouses, addWarehouse, updateWarehouse,
        stock, getStock, updateStock,
        movements, addMovement,
        // Sales
        salesOffers, addSalesOffer, updateSalesOffer,
        salesOrders, addSalesOrder, updateSalesOrder,
        customerInvoices, addCustomerInvoice, updateCustomerInvoice,
        // Purchases
        purchaseQuotes, addPurchaseQuote, updatePurchaseQuote,
        purchaseOrders, addPurchaseOrder, updatePurchaseOrder,
        supplierInvoices, addSupplierInvoice, updateSupplierInvoice,
        // Finance
        chartOfAccounts, addAccount, updateAccount, deleteAccount,
        payments, addPayment, updatePayment,
        // Expenses
        expenses, addExpense, updateExpense, deleteExpense,
        departments, addDepartment, updateDepartment,
        expenseCategories, addExpenseCategory, updateExpenseCategory,
        expenseSubcategories, addExpenseSubcategory, updateExpenseSubcategory,
        divisions, addDivision, updateDivision,
        // Config
        roles, addRole, updateRole,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
