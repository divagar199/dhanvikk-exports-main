/**
 * Dhanvikk Blooms & Exports - Dual Telemetry & Activity Engine
 * Strictly isolates:
 *  1. Customer Telemetry: logins, wishlists, cart additions, and most time spent (dwell time) products.
 *  2. Staff Operations & Audit: staff logins, modifications, and daily attendance logs.
 */

const CUSTOMER_LOGS_KEY = 'dhanvikk_customer_activity_logs';
const CUSTOMER_DWELL_KEY = 'dhanvikk_customer_dwell_logs';
const STAFF_AUDIT_KEY = 'dhanvikk_staff_audit_logs';
const STAFF_ATTENDANCE_KEY = 'dhanvikk_staff_attendance_logs';

/**
 * -------------------------------------------------------------
 * 1. CUSTOMER TELEMETRY
 * -------------------------------------------------------------
 */

export function logCustomerActivity({
  type, // 'LOGIN' | 'WISHLIST_ADD' | 'CART_ADD' | 'PURCHASE' | 'PAGE_VIEW'
  email = 'guest@dhanvikk.com',
  name = 'Guest Visitor',
  productId = null,
  productName = null,
  sku = null,
  metadata = {},
}) {
  try {
    const raw = localStorage.getItem(CUSTOMER_LOGS_KEY);
    const logs = raw ? JSON.parse(raw) : [];

    const newLog = {
      id: `cust-act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      type,
      email,
      name,
      productId,
      productName,
      sku,
      metadata,
    };

    logs.unshift(newLog);
    // Keep last 500 customer logs
    localStorage.setItem(CUSTOMER_LOGS_KEY, JSON.stringify(logs.slice(0, 500)));

    // Cross-window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dhanvikk_customer_activity', { detail: newLog }));
    }
  } catch (e) {
    console.warn('Customer telemetry log error:', e);
  }
}

/**
 * Records time spent (dwell time in seconds) on a specific product.
 */
export function recordProductDwellTime(productId, secondsSpent = 5, productName = '', sku = '') {
  if (!productId || secondsSpent <= 0) return;
  try {
    const raw = localStorage.getItem(CUSTOMER_DWELL_KEY);
    const dwellMap = raw ? JSON.parse(raw) : {};

    if (!dwellMap[productId]) {
      dwellMap[productId] = {
        productId,
        productName: productName || 'Luxury Botanical Bouquet',
        sku: sku || '2610300001',
        totalSeconds: 0,
        viewCount: 0,
        lastViewed: new Date().toISOString(),
      };
    }

    dwellMap[productId].totalSeconds += Math.round(secondsSpent);
    dwellMap[productId].viewCount += 1;
    dwellMap[productId].lastViewed = new Date().toISOString();
    if (productName) dwellMap[productId].productName = productName;
    if (sku) dwellMap[productId].sku = sku;

    localStorage.setItem(CUSTOMER_DWELL_KEY, JSON.stringify(dwellMap));
  } catch (e) {
    console.warn('Product dwell time log error:', e);
  }
}

/**
 * Returns products sorted by highest time spent by customers.
 */
export function getMostTimeSpentProducts() {
  try {
    const raw = localStorage.getItem(CUSTOMER_DWELL_KEY);
    if (!raw) return [];
    const dwellMap = JSON.parse(raw);
    const list = Object.values(dwellMap);
    return list.sort((a, b) => b.totalSeconds - a.totalSeconds);
  } catch {
    return [];
  }
}

export function getCustomerActivityLogs() {
  try {
    const raw = localStorage.getItem(CUSTOMER_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * -------------------------------------------------------------
 * 2. STAFF AUDIT & OPERATIONS TELEMETRY
 * -------------------------------------------------------------
 */

export function logStaffAction({
  action, // 'CREATE_PRODUCT' | 'UPDATE_PRICE' | 'INWARD_STOCK' | 'OUTWARD_DISPATCH' | 'UPDATE_ORDER' | 'LOGIN'
  module,
  staffEmail = 'divagar.m.msc.cs@gmail.com',
  staffName = 'Divagar (Super Admin)',
  role = 'super_admin',
  resourceId = 'N/A',
  details = '',
}) {
  try {
    const raw = localStorage.getItem(STAFF_AUDIT_KEY);
    const logs = raw ? JSON.parse(raw) : [];

    const newLog = {
      id: `staff-act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      action,
      module,
      staffEmail,
      staffName,
      role,
      resourceId,
      details,
    };

    logs.unshift(newLog);
    localStorage.setItem(STAFF_AUDIT_KEY, JSON.stringify(logs.slice(0, 500)));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dhanvikk_staff_audit', { detail: newLog }));
    }
  } catch (e) {
    console.warn('Staff audit log error:', e);
  }
}

export function getStaffAuditLogs() {
  try {
    const raw = localStorage.getItem(STAFF_AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * -------------------------------------------------------------
 * 3. STAFF DAILY ATTENDANCE SYSTEM
 * -------------------------------------------------------------
 */

export function logStaffAttendance({
  staffId = 'STF-SUPER-01',
  staffName = 'Divagar M',
  position = 'Super Admin',
  status = 'Present', // 'Present' | 'On Duty' | 'Half Day' | 'Leave'
  clockIn = '09:00 AM',
  clockOut = '06:00 PM',
  notes = 'Daily operations clearance',
}) {
  try {
    const raw = localStorage.getItem(STAFF_ATTENDANCE_KEY);
    const logs = raw ? JSON.parse(raw) : [];

    const todayStr = new Date().toISOString().split('T')[0];
    const existingIdx = logs.findIndex((l) => l.staffId === staffId && l.date === todayStr);

    const record = {
      id: `att-${todayStr}-${staffId}`,
      date: todayStr,
      staffId,
      staffName,
      position,
      status,
      clockIn,
      clockOut,
      notes,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      logs[existingIdx] = record;
    } else {
      logs.unshift(record);
    }

    localStorage.setItem(STAFF_ATTENDANCE_KEY, JSON.stringify(logs));
    return record;
  } catch (e) {
    console.warn('Attendance log error:', e);
    return null;
  }
}

export function getStaffAttendanceLogs() {
  try {
    const raw = localStorage.getItem(STAFF_ATTENDANCE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}


export function recordCustomerAction(type, data = {}, user = null) {
  return logCustomerActivity({
    type,
    email: user?.email || 'guest@dhanvikk.com',
    name: user?.name || 'Guest Patron',
    productId: data.productId,
    productName: data.productName,
    sku: data.sku,
    metadata: data,
  });
}

export const getCustomerActions = getCustomerActivityLogs;
