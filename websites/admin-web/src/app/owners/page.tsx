'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AdminService } from '../../services/admin';
import { OwnerProfile } from '../../types';
import {
  Search,
  Check,
  X,
  AlertTriangle,
  Building,
  Mail,
  Phone,
  FileText,
  Clock,
  Eye,
  XCircle,
} from 'lucide-react';

export default function OwnersManagement() {
  const [owners, setOwners] = useState<OwnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedOwner, setSelectedOwner] = useState<OwnerProfile | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const data = await AdminService.getOwners();
      setOwners(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleVerify = async (status: OwnerProfile['kyc_status']) => {
    if (!selectedOwner) return;
    if (!verificationNotes.trim()) {
      setVerificationFeedback('Decision notes are required to process verification!');
      setTimeout(() => setVerificationFeedback(''), 4000);
      return;
    }
    try {
      await AdminService.verifyOwner(selectedOwner.id, status, verificationNotes);
      // Local state update
      setOwners((prev) =>
        prev.map((owner) => (owner.id === selectedOwner.id ? { ...owner, kyc_status: status } : owner))
      );
      setSelectedOwner((prev) => (prev ? { ...prev, kyc_status: status } : null));
      setVerificationNotes('');
      setVerificationFeedback(`Successfully updated owner status to ${status}!`);
      setTimeout(() => setVerificationFeedback(''), 3000);
    } catch (err: any) {
      setVerificationFeedback(`Failed to update status: ${err.message}`);
    }
  };

  const openDocument = (url: string) => {
    if (url.startsWith('data:')) {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const filteredOwners = owners.filter((owner) => {
    const nameMatch = `${owner.user.first_name} ${owner.user.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const companyMatch = (owner.company_name || '').toLowerCase().includes(search.toLowerCase());
    const statusMatch = filterStatus === 'ALL' || owner.kyc_status === filterStatus;
    return (nameMatch || companyMatch) && statusMatch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Owner Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Verify and manage Paying Guest owner profiles and business documents.</p>
        </div>

        {/* Toolbar Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search owners or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`flex-1 sm:flex-none rounded-lg px-3 py-1.5 text-xs font-semibold border border-border cursor-pointer transition-colors ${
                  filterStatus === st ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Content Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Owners Table */}
          <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading owner listings...</div>
            ) : filteredOwners.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No matching owners found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Owner Name</th>
                      <th className="px-6 py-4">Company Details</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Registered Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredOwners.map((owner) => (
                      <tr key={owner.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {owner.user.first_name} {owner.user.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Mail className="h-3.5 w-3.5" /> {owner.user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{owner.company_name || 'N/A'}</span>
                            <span className="text-xs text-muted-foreground mt-1">GST: {owner.gst_number || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              owner.kyc_status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : owner.kyc_status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-500'
                                : owner.kyc_status === 'SUSPENDED'
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'bg-slate-500/10 text-slate-500'
                            }`}
                          >
                            {owner.kyc_status === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                            {owner.kyc_status === 'APPROVED' && <Check className="h-3.5 w-3.5" />}
                            {owner.kyc_status === 'SUSPENDED' && <AlertTriangle className="h-3.5 w-3.5" />}
                            {owner.kyc_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(owner.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedOwner(owner)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspect KYC
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Side Drawer: Document inspection */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[400px]">
            {selectedOwner ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-bold text-lg">KYC Dossier</h3>
                  <button onClick={() => setSelectedOwner(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                {verificationFeedback && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${
                      verificationFeedback.includes('Failed') ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {verificationFeedback}
                  </div>
                )}

                {/* Owner details card */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedOwner.user.profile_image?.url ? (
                      <img
                        src={selectedOwner.user.profile_image.url}
                        alt="Profile"
                        className="h-11 w-11 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                        {selectedOwner.user.first_name[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-foreground">
                        {selectedOwner.user.first_name} {selectedOwner.user.last_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">Owner ID: {selectedOwner.id}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST Identification:</span>
                      <span className="font-semibold text-foreground">{selectedOwner.gst_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered Company:</span>
                      <span className="font-semibold text-foreground">{selectedOwner.company_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact Phone:</span>
                      <span className="font-semibold text-foreground">{selectedOwner.user.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">KYC status:</span>
                      <span className="font-semibold text-foreground">{selectedOwner.kyc_status}</span>
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="border border-border/80 rounded-xl p-4 bg-muted/30">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">KYC Documents Log</span>
                  {selectedOwner.owner_documents && selectedOwner.owner_documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOwner.owner_documents.map((doc: any) => {
                        const docUrl = doc.url && (doc.url.startsWith('http') || doc.url.startsWith('/') || doc.url.startsWith('data:')) ? doc.url : `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
                        return (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => openDocument(docUrl)}
                            className="w-full text-left flex items-center gap-3 bg-card border border-border p-3 rounded-lg hover:bg-muted/40 transition-colors"
                          >
                            <FileText className="h-8 w-8 text-primary shrink-0" />
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-xs font-semibold truncate">{doc.type.replace('_', ' ')}</span>
                              <span className="text-[10px] text-muted-foreground truncate">{docUrl}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => openDocument("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")}
                        className="w-full text-left flex items-center gap-3 bg-card border border-border p-3 rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        <FileText className="h-8 w-8 text-primary shrink-0" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-semibold">Permanent Account Number (PAN)</span>
                          <span className="text-[10px] text-muted-foreground">Sample PAN Card Link</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDocument("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")}
                        className="w-full text-left flex items-center gap-3 bg-card border border-border p-3 rounded-lg hover:bg-muted/40 transition-colors mt-2"
                      >
                        <Building className="h-8 w-8 text-indigo-500 shrink-0" />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-semibold">Certificate of Incorporation</span>
                          <span className="text-[10px] text-muted-foreground">Sample Incorporation Certificate</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Decision Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Decision Notes</label>
                  <textarea
                    placeholder="Feedback or audit justification..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>

                {/* Verification Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify('APPROVED')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-white py-2.5 text-xs font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleVerify('REJECTED')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-muted-foreground py-2.5 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleVerify('SUSPENDED')}
                    className="rounded-xl border border-border bg-card text-muted-foreground px-3 py-2.5 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-colors cursor-pointer"
                    title="Suspend Profile"
                  >
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6 border-2 border-dashed border-border/80 rounded-2xl">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <FileText className="h-10 w-10 text-muted-foreground/60" />
                  <p className="text-sm font-semibold">No KYC selected</p>
                  <p className="text-xs">Click "Inspect KYC" in the owners listing to inspect attachments and alter verified status.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
