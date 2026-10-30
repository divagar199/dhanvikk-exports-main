import React, { useState } from 'react';
import {
  Building,
  Save,
  Globe,
  CreditCard,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  FileText,
  UserCheck,
  Clock,
  Plus,
  Users,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { logStaffAttendance, getStaffAttendanceLogs } from '../../../../utils/telemetryService';

const STAFF_POSITIONS = [
  { id: 'manager', label: 'Store Manager (Operations & Orders)' },
  { id: 'florist_lead', label: 'Master Florist (Catalog & Stems Atelier)' },
  { id: 'inventory_manager', label: 'Inventory Lead (Inward Purchases & Storage)' },
  { id: 'delivery_manager', label: 'Cold-Chain Dispatch Coordinator' },
  { id: 'staff', label: 'General Operations Staff' },
];

export default function AdminSettings({ settings = {}, onSave, onLogAudit, superAdminEmail = 'divagar.m.msc.cs@gmail.com' }) {
  const [formData, setFormData] = useState({
    companyName: 'Dhanvikk Blooms & Exports Pvt. Ltd.',
    iecCode: '0412039841',
    gstin: '33AAACD1234F1Z5',
    apedaRegNo: 'APEDA-FLW-2026-9812',
    exportPort: 'Chennai Air Cargo & Ennore Port',
    headquarters: 'No. 48/2, Floriculture Gateway, GST Road, Chennai, Tamil Nadu, 600027, India',
    bankName: 'HDFC Bank Ltd',
    swiftCode: 'HDFCINBBXXX',
    bankAccountNumber: '50200084920194',
    bankBranch: 'Chennai Commercial & Global Trade Branch',
    invoicePrefix: 'DHN-INV',
    taxRate: 5,
    logoUrl: '/dhanvikk-brand-logo.png',
    termsAndConditions: 'Stems conditioned at 2°C-4°C reefer transit. Subject to Chennai jurisdiction.',
    ...settings,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState(() => getStaffAttendanceLogs());
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    staffName: 'Divagar M',
    position: 'Super Admin',
    status: 'Present',
    clockIn: '09:00 AM',
    clockOut: '06:00 PM',
    notes: 'Super Admin active on console.',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (typeof onSave === 'function') {
        await onSave(formData);
      }
      localStorage.setItem('dhanvikk_invoice_settings', JSON.stringify(formData));
      onLogAudit?.('UPDATE', 'SETTINGS', 'global_settings', 'Updated company export profile, invoice controls, and bank settings');
      toast.success('Admin settings & invoice controls saved successfully! 🌸');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAttendance = (e) => {
    e.preventDefault();
    const record = logStaffAttendance({
      staffId: `STF-${Date.now().toString().slice(-4)}`,
      staffName: attendanceForm.staffName,
      position: attendanceForm.position,
      status: attendanceForm.status,
      clockIn: attendanceForm.clockIn,
      clockOut: attendanceForm.clockOut,
      notes: attendanceForm.notes,
    });
    if (record) {
      setAttendanceLogs(getStaffAttendanceLogs());
      toast.success(`Attendance recorded for ${attendanceForm.staffName} (${attendanceForm.status})! ⏱️`);
      setShowAttendanceModal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Company Registration & Legal Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
            <div className="p-2 rounded-xl bg-rose-50 text-[#E11D48] border border-rose-200">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Company Export Profile & Legal Accreditation
              </h2>
              <p className="text-xs text-slate-500">
                Official credentials printed on international export documents, phytosanitary certificates & tax invoices.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Registered Entity Name</label>
              <input
                type="text"
                required
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Importer Exporter Code (IEC Code)
              </label>
              <input
                type="text"
                required
                value={formData.iecCode || ''}
                onChange={(e) => setFormData({ ...formData, iecCode: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                GSTIN / Tax Registration
              </label>
              <input
                type="text"
                required
                value={formData.gstin || ''}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                APEDA Floriculture Registration #
              </label>
              <input
                type="text"
                value={formData.apedaRegNo || ''}
                onChange={(e) => setFormData({ ...formData, apedaRegNo: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Primary Port of Loading</label>
              <input
                type="text"
                value={formData.exportPort || ''}
                onChange={(e) => setFormData({ ...formData, exportPort: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Registered Headquarters Address</label>
              <input
                type="text"
                value={formData.headquarters || ''}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Invoice & Tax Bill Generation Settings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
            <div className="p-2 rounded-xl bg-rose-50 text-[#E11D48] border border-rose-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Invoice & Customer Bill Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Set numbering prefixes, tax rates, and legal footer notes for client invoices.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Invoice / Bill Number Prefix</label>
              <input
                type="text"
                required
                value={formData.invoicePrefix || 'DHN-INV'}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. {formData.invoicePrefix || 'DHN-INV'}-261030-0001</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Applicable GST / Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                value={formData.taxRate || 5}
                onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Standard Indian Floriculture GST is 5%</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Invoice Footer Terms & Conditions</label>
              <textarea
                rows={2}
                value={formData.termsAndConditions || ''}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Trade Bank & Wire Transfer Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Commercial Bank & Wire Transfer Instructions
              </h2>
              <p className="text-xs text-slate-500">
                Banking credentials inserted into generated invoices for client direct wire transfers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bank SWIFT / BIC Code</label>
              <input
                type="text"
                value={formData.swiftCode || ''}
                onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-rose-500 text-rose-700"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankAccountNumber || ''}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Branch Name</label>
              <input
                type="text"
                value={formData.bankBranch || ''}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                className="w-full h-9.5 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Settings...' : 'Save Settings & Invoice Controls'}</span>
          </button>
        </div>
      </form>

      {/* 4. Staff Daily Attendance Roster & Position Manager */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Staff Daily Attendance & Duty Roster
              </h2>
              <p className="text-xs text-slate-500">
                Track daily duty clock-in, operational positions (Manager, Florist, Dispatch), and working records.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAttendanceModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Mark Today's Attendance</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Staff Member</th>
                <th className="py-2.5 px-3">Operational Position</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 font-mono">Clock In</th>
                <th className="py-2.5 px-3 font-mono">Clock Out</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    No attendance records logged yet today. Use "+ Mark Today's Attendance" above.
                  </td>
                </tr>
              ) : (
                attendanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono text-slate-600">{log.date}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{log.staffName}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {log.position}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{log.clockIn}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{log.clockOut}</td>
                    <td className="py-3 px-3 text-slate-500">{log.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Mark Staff Daily Attendance</h3>
            <form onSubmit={handleMarkAttendance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  value={attendanceForm.staffName}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, staffName: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Position / Role</label>
                <select
                  value={attendanceForm.position}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, position: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800"
                >
                  <option value="Super Admin">Super Admin (Divagar M)</option>
                  {STAFF_POSITIONS.map((p) => (
                    <option key={p.id} value={p.label}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duty Status</label>
                  <select
                    value={attendanceForm.status}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800"
                  >
                    <option value="Present">Present (Full Shift)</option>
                    <option value="On Duty">On Duty (Logistics / Reefer)</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Clock In Time</label>
                  <input
                    type="text"
                    value={attendanceForm.clockIn}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, clockIn: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
