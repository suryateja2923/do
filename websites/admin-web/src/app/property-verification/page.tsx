'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AdminService } from '../../services/admin';
import { Property } from '../../types';
import {
  Check,
  X,
  MapPin,
  Building,
  Image as ImageIcon,
  Compass,
  CheckSquare,
  Clock,
  Eye,
  Info,
} from 'lucide-react';

export default function PropertyVerification() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      const data = await AdminService.getProperties();
      // filter only pending
      setProperties(data.filter((p) => p.kyc_status === 'PENDING'));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleVerify = async (status: Property['kyc_status']) => {
    if (!selectedProperty) return;
    if (!verificationNotes.trim()) {
      setStatusMessage('Decision notes are required to process property verification!');
      setTimeout(() => setStatusMessage(''), 4000);
      return;
    }
    try {
      await AdminService.verifyProperty(selectedProperty.id, status, verificationNotes);
      // remove from listing since it is no longer pending
      setProperties((prev) => prev.filter((p) => p.id !== selectedProperty.id));
      setSelectedProperty(null);
      setVerificationNotes('');
      setStatusMessage(`Property successfully ${status}!`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Property KYC Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">Review pending property submissions and approve them to go active on the mobile booking app.</p>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm font-semibold max-w-lg">
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Table list */}
          <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-muted/30">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Approvals Queue</span>
            </div>
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading queue...</div>
            ) : properties.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                <Check className="h-10 w-10 text-emerald-500" />
                <p className="font-semibold text-foreground">Clean Queue!</p>
                <p className="text-xs">No pending coliving properties require review at this time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Owner Name</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                              <Building className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{prop.name}</span>
                              <span className="text-xs text-muted-foreground mt-1">ID: {prop.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {prop.city?.name}, {prop.state?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-foreground">
                            {prop.owner?.user.first_name} {prop.owner?.user.last_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedProperty(prop)}
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

          {/* Details side drawer */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[400px]">
            {selectedProperty ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-bold text-lg">Verification Portal</h3>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-md">{selectedProperty.name}</h4>
                      <p className="text-xs text-muted-foreground">Owner GST: {selectedProperty.owner?.gst_number}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedProperty.description}</p>
                </div>

                {/* Info block */}
                <div className="border border-border/80 rounded-xl p-4 bg-muted/20 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address Location:</span>
                    <span className="font-medium">{selectedProperty.address_line1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Landmark:</span>
                    <span className="font-medium">{selectedProperty.landmark || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Geo coordinates:</span>
                    <span className="font-medium flex items-center gap-0.5">
                      <Compass className="h-3 w-3 text-primary" /> {selectedProperty.latitude}, {selectedProperty.longitude}
                    </span>
                  </div>
                </div>

                {/* Images */}
                <div className="border border-border/80 rounded-xl p-4 bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Submitted Images</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((num) => (
                      <div
                        key={num}
                        className="h-16 rounded-lg bg-muted flex items-center justify-center border border-border/60 hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="border border-border/80 rounded-xl p-4 bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Amenities list</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['High-Speed Wifi', 'Power Backup', 'CCTV Security', 'Housekeeping'].map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1 rounded bg-background border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground"
                      >
                        <CheckSquare className="h-3 w-3 text-emerald-500" /> {amenity}
                      </span>
                    ))}
                  </div>
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

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify('APPROVED')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-white py-2.5 text-xs font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Approve PG
                  </button>
                  <button
                    onClick={() => handleVerify('REJECTED')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-muted-foreground py-2.5 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" /> Reject PG
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6 border-2 border-dashed border-border/80 rounded-2xl">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Clock className="h-10 w-10 text-muted-foreground/60 animate-pulse" />
                  <p className="text-sm font-semibold">Select PG for review</p>
                  <p className="text-xs">Select a pending property entry in the left list queue to verify its details and release it to the platform directory.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
