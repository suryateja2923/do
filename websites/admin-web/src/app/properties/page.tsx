'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AdminService } from '../../services/admin';
import { Property } from '../../types';
import {
  Search,
  Check,
  X,
  MapPin,
  Building,
  Image as ImageIcon,
  Compass,
  Layers,
  CheckSquare,
  Clock,
  Eye,
  Info,
} from 'lucide-react';

export default function PropertiesManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');

  const resolveStatus = (property: Property): Property['kyc_status'] => {
    const kyc = (property as any).kyc_status;
    if (kyc === 'APPROVED' || kyc === 'PENDING' || kyc === 'REJECTED' || kyc === 'SUSPENDED') {
      return kyc;
    }

    const approval = (property as any).approval_status;
    if (approval === 'VERIFIED') return 'APPROVED';
    if (approval === 'PENDING') return 'PENDING';
    if (approval === 'REJECTED') return 'REJECTED';

    return 'PENDING';
  };

  const getImageUrls = (property: Property | null): string[] => {
    if (!property) return [];

    const fromLegacy = ((property as any).property_images || [])
      .map((img: any) => img?.image_url)
      .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0);

    const fromCurrent = ((property as any).images || [])
      .map((img: any) => img?.url)
      .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0);

    return [...fromLegacy, ...fromCurrent];
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await AdminService.getProperties();
      setProperties(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleVerify = async (status: Property['kyc_status']) => {
    if (!selectedProperty) return;
    const selectedId = selectedProperty.id;
    if (!verificationNotes.trim()) {
      setStatusMessage('Decision notes are required to process property verification!');
      setTimeout(() => setStatusMessage(''), 4000);
      return;
    }
    try {
      await AdminService.verifyProperty(selectedId, status, verificationNotes);
      // Refresh from backend so status transitions are sourced from persisted DB state.
      await fetchProperties();
      setSelectedProperty((prev) => (prev ? { ...prev, kyc_status: status } : null));
      setVerificationNotes('');
      setStatusMessage(`Saved to database: Property moved to ${status} section.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      setStatusMessage(`Error verifying property: ${err.message}`);
    }
  };

  const filteredProperties = properties.filter((prop) => {
    const nameMatch = prop.name.toLowerCase().includes(search.toLowerCase());
    const ownerMatch = `${prop.owner?.user.first_name} ${prop.owner?.user.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const statusMatch = filterStatus === 'ALL' || resolveStatus(prop) === filterStatus;
    return (nameMatch || ownerMatch) && statusMatch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">PG Property Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Review paying guest facilities, locations, sharing configurations, and verify listings.</p>
        </div>

        {/* Filters and search toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by PG name or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
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

        {/* Content Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Properties Table */}
          <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading properties...</div>
            ) : filteredProperties.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No matching properties found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Owner Name</th>
                      <th className="px-6 py-4">Verification</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
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
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              resolveStatus(prop) === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : resolveStatus(prop) === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {resolveStatus(prop) === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                            {resolveStatus(prop) === 'APPROVED' && <Check className="h-3.5 w-3.5" />}
                            {resolveStatus(prop)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedProperty(prop)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Side Drawer: Detailed Inspection */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[400px]">
            {selectedProperty ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-bold text-lg">Property Details</h3>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    aria-label="Close property details"
                    title="Close"
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {statusMessage && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${
                      statusMessage.includes('Error') ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}

                {/* Property Headline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-md">{selectedProperty.name}</h4>
                      <p className="text-xs text-muted-foreground">Owner: {selectedProperty.owner?.company_name}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedProperty.description}</p>
                </div>

                {/* Location Grid details */}
                <div className="border border-border/80 rounded-xl p-4 bg-muted/20 space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Address Details</span>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Line 1:</span>
                      <span className="font-medium">{selectedProperty.address_line1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Metro/Landmark:</span>
                      <span className="font-medium">{selectedProperty.landmark || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PIN Code:</span>
                      <span className="font-medium">{selectedProperty.zip_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Geo coordinates:</span>
                      <span className="font-medium flex items-center gap-0.5">
                        <Compass className="h-3 w-3 text-primary" /> {selectedProperty.latitude}, {selectedProperty.longitude}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Facility Images */}
                <div className="border border-border/80 rounded-xl p-4 bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">Facility Images</span>
                  {getImageUrls(selectedProperty).length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {getImageUrls(selectedProperty).slice(0, 6).map((imgUrl, idx) => (
                        <div key={`${imgUrl}-${idx}`} className="h-16 rounded-lg overflow-hidden border border-border/60 bg-muted">
                          <img src={imgUrl} alt="Facility" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-16 rounded-lg bg-muted flex items-center justify-center border border-border/60">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
                    </div>
                  )}
                </div>

                {/* Amenities overview */}
                <div className="border border-border/80 rounded-xl p-4 bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Amenities Provided</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['AC', 'High-Speed Wifi', 'Power Backup', 'CCTV Security', 'Washing Machine', 'Housekeeping'].map((amenity) => (
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

                {/* Verification Action Drawer */}
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
                  <Info className="h-10 w-10 text-muted-foreground/60" />
                  <p className="text-sm font-semibold">No property selected</p>
                  <p className="text-xs">Select a property in the main directory to view detail logs, amenities, coordinates, and change its approval state.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
