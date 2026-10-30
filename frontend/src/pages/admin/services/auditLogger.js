import { db } from '../../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const LOCAL_AUDIT_KEY = 'dhanvikk_audit_logs';

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  STATUS_CHANGE: 'STATUS_CHANGE',
  EXPORT_CSV: 'EXPORT_CSV',
  LOGIN: 'LOGIN',
};

export const AUDIT_MODULES = {
  PRODUCTS: 'PRODUCTS',
  ORDERS: 'ORDERS',
  ENQUIRIES: 'ENQUIRIES',
  INVENTORY: 'INVENTORY',
  STAFF: 'STAFF',
  SETTINGS: 'SETTINGS',
  CMS: 'CMS',
  DOCUMENTS: 'DOCUMENTS',
};

export const auditLogger = {
  async log({
    action,
    module,
    resourceId,
    details,
    actorEmail,
    actorName,
    actorRole,
  }) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      module,
      resourceId: resourceId || 'N/A',
      details: details || '',
      actorEmail: actorEmail || 'divagar.m.msc.cs@gmail.com',
      actorName: actorName || 'Divagar (Super Admin)',
      actorRole: actorRole || 'super_admin',
      ipAddress: '127.0.0.1 (Internal Console)',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
    };

    // 1. Resilient localStorage storage
    try {
      const existingRaw = localStorage.getItem(LOCAL_AUDIT_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [entry, ...existing.slice(0, 199)]; // Keep latest 200 logs
      localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[auditLogger] Local storage write notice:', e.message);
    }

    // 2. Firestore collection write
    try {
      if (db) {
        await addDoc(collection(db, 'auditLogs'), {
          ...entry,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      // Non-fatal if offline or restricted by rules
      console.warn('[auditLogger] Firestore write notice:', err.message);
    }

    return entry;
  },

  getLocalLogs() {
    try {
      const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },
};

