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
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings({ settings, onSaveSettings, onLogAudit }) {
  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSaveSettings(formData);
      onLogAudit?.('UPDATE', 'SETTINGS', 'global_settings', 'Updated company export profile & trade bank settings');
      toast.success('Company export settings & bank details saved successfully.');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Registration Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Company Export Profile & Legal Accreditation
              </h2>
              <p className="text-xs text-slate-500">
                Official export entity credentials printed on international customs invoices & shipping manifests.
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

        {/* International Bank & SWIFT Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                International Trade Bank & SWIFT Wire Transfer Instructions
              </h2>
              <p className="text-xs text-slate-500">
                Banking details inserted into generated Proforma Invoices for foreign currency settlement.
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

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Settings...' : 'Save Export Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

