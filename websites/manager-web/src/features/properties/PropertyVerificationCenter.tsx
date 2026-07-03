'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ManagerService } from '@/services/manager';
import { Property, ManagerProperty } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { managerQueryKeys } from '@/lib/queryKeys';
import { QUERY_POLICY } from '@/config/queryPolicy';
import { Card, SkeletonLoader, StatusBadge, EmptyState, Button } from '@/shared';
import { useFilters, useSearch } from '@/hooks/useShared';
import { formatDate } from '@/utils';
import {
  Building2,
  CheckCircle,
  CheckSquare,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  MapPin,
  Maximize2,
  Image as ImageIcon,
  Check,
  Send,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_PROPERTIES: ManagerProperty[] = [];

export const PropertyVerificationCenter: React.FC = () => {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');
  const queryClient = useQueryClient();

  const {
    data: properties = EMPTY_PROPERTIES,
    isLoading: loading,
    error,
    refetch: fetchProperties,
  } = useQuery<ManagerProperty[]>({
    queryKey: managerQueryKeys.properties,
    queryFn: ManagerService.getProperties as () => Promise<ManagerProperty[]>,
    refetchInterval: QUERY_POLICY.LIVE_REFRESH_INTERVAL_MS,
    retry: QUERY_POLICY.RETRY_COUNT,
  });
  
  const [selectedProperty, setSelectedProperty] = useState<ManagerProperty | null>(null);

  const { filters, updateFilter } = useFilters({
    status: 'ALL' as 'ALL' | ManagerProperty['kyc_status'],
  });

  const { query: search, setQuery: setSearch, filteredItems: searchedProps } = useSearch(properties, ['name']);

  // Actions states
  const [notes, setNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [correctionFlags, setCorrectionFlags] = useState<string[]>([]);
  const correctionOptions = ['Inaccurate address', 'Blurry room photos', 'Missing security amenities', 'Mispriced room pricing'];

  const verifyPropertyMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ManagerProperty['kyc_status']; notes: string }) =>
      ManagerService.verifyProperty(id, status, notes),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.properties }),
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard }),
      ]);
    },
  });

  const requestCorrectionsMutation = useMutation({
    mutationFn: ({ id, corrections, notes }: { id: string; corrections: string[]; notes: string }) =>
      ManagerService.requestPropertyCorrections(id, corrections, notes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: managerQueryKeys.properties });
    },
  });

  const suspendPropertyMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => ManagerService.suspendProperty(id, notes),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.properties }),
        queryClient.invalidateQueries({ queryKey: managerQueryKeys.dashboard }),
      ]);
    },
  });

  const getImageUrls = (property: ManagerProperty | null): string[] => {
    if (!property) return [];

    const urlsFromLegacy = (property.property_images || [])
      .map((img: any) => img?.image_url)
      .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0);

    const urlsFromCurrent = (property.images || [])
      .map((img: any) => img?.url)
      .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0);

    return [...urlsFromLegacy, ...urlsFromCurrent];
  };

  useEffect(() => {
    if (initialId && properties && properties.length > 0) {
      const prop = properties.find((p) => p.id === initialId);
      if (prop) handleSelectProperty(prop);
    }
  }, [initialId, properties]);

  const handleSelectProperty = (property: ManagerProperty) => {
    setSelectedProperty(property);
    setNotes('');
    setCorrectionFlags([]);
    const imageUrls = getImageUrls(property);
    setSelectedImage(imageUrls[0] || null);
  };

  const handleVerify = async (status: ManagerProperty['kyc_status']) => {
    if (!selectedProperty) return;
    if (!notes.trim()) {
      toast.warning('Notes required', { description: 'Please enter feedback before submitting.' });
      return;
    }

    setSubmittingAction(true);
    try {
      await verifyPropertyMutation.mutateAsync({ id: selectedProperty.id, status, notes });
      toast.success(`Property status updated to ${status}`);
      fetchProperties();
      setSelectedProperty(null);
    } catch (err: any) {
      toast.error('Failed to update property status', {
        description: err?.message || 'Server rejected property verification update.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRequestCorrections = async () => {
    if (!selectedProperty) return;
    if (correctionFlags.length === 0) {
      toast.warning('Select flags', { description: 'Please flag at least one incorrect config.' });
      return;
    }
    if (!notes.trim()) {
      toast.warning('Notes required', { description: 'Please detail adjustments in feedback.' });
      return;
    }

    setSubmittingAction(true);
    try {
      await requestCorrectionsMutation.mutateAsync({ id: selectedProperty.id, corrections: correctionFlags, notes });
      toast.success('Correction request sent');
      setSelectedProperty(null);
    } catch (err: any) {
      toast.error('Failed to request corrections', {
        description: err?.message || 'Server rejected correction request.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedProperty) return;
    if (!notes.trim()) {
      toast.warning('Suspension notes required');
      return;
    }

    setSubmittingAction(true);
    try {
      await suspendPropertyMutation.mutateAsync({ id: selectedProperty.id, notes });
      toast.success('Property listing suspended');
      fetchProperties();
      setSelectedProperty(null);
    } catch (err: any) {
      toast.error('Failed to suspend property', {
        description: err?.message || 'Server rejected suspension request.',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredProperties = searchedProps.filter((p) => {
    return filters.status === 'ALL' || p.kyc_status === filters.status;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => updateFilter('status', s)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                filters.status === s
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-card border-border hover:bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Clock className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listing */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonLoader className="h-36 rounded-2xl" />
              <SkeletonLoader className="h-36 rounded-2xl" />
            </div>
          ) : error ? (
            <EmptyState title="Failed To Load Properties" description={error} icon={AlertTriangle} />
          ) : filteredProperties.length === 0 ? (
            <EmptyState title="No Properties found" description="No properties matching current filters." icon={Building2} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => handleSelectProperty(prop)}
                  className={`rounded-2xl border p-5 bg-card shadow-sm cursor-pointer transition-all duration-200 hover:border-primary/50 relative overflow-hidden group ${
                    selectedProperty?.id === prop.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{prop.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /> {prop.city?.name}
                      </p>
                    </div>
                    <StatusBadge status={prop.kyc_status} />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span>Rooms: {prop.rooms?.length || 0} &bull; Shared config</span>
                    <span>Listed: {formatDate(prop.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Card */}
        <div className="lg:col-span-1">
          {selectedProperty ? (
            <Card className="sticky top-24 max-h-[85vh] overflow-y-auto animate-in fade-in duration-200 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-base">Property Listing Audit</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedProperty.name}</p>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Photos carousels */}
              {getImageUrls(selectedProperty).length > 0 && (
                <div className="space-y-2">
                  <div className="aspect-video w-full rounded-xl bg-muted overflow-hidden relative border border-border">
                    {selectedImage ? (
                      <img src={selectedImage} alt="Property Room" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {getImageUrls(selectedProperty).map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(imgUrl)}
                        aria-label={`Select property image ${idx + 1}`}
                        title={`Image ${idx + 1}`}
                        className={`h-11 w-16 rounded-lg overflow-hidden border shrink-0 cursor-pointer ${
                          selectedImage === imgUrl ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuration parameters */}
              <div className="space-y-4 text-xs">
                <div className="bg-muted/20 border border-border/30 rounded-xl p-4 space-y-2.5">
                  <p className="font-bold flex items-center gap-1.5 text-foreground">
                    <MapPin className="h-4 w-4 text-primary" /> Location & Mapping Details
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProperty.address_line1}, {selectedProperty.city?.name}
                  </p>
                  <div className="flex gap-4 pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                    <span>Lat: {selectedProperty.latitude}</span>
                    <span>Lng: {selectedProperty.longitude}</span>
                  </div>
                </div>

                <div className="bg-muted/20 border border-border/30 rounded-xl p-4 space-y-2.5">
                  <p className="font-bold flex items-center gap-1.5 text-foreground">
                    <Maximize2 className="h-4 w-4 text-primary" /> Amenities & Security Parameters
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(selectedProperty.amenities || []).map((amenity: string, idx: number) => (
                      <span key={idx} className="bg-background border border-border rounded px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Decision Form */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Decision Notes</label>
                  <textarea
                    placeholder="Provide audit feedback or corrections required..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Flags selections */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground">Flag Corrections</label>
                  <div className="grid grid-cols-2 gap-2">
                    {correctionOptions.map((flag) => {
                      const isSelected = correctionFlags.includes(flag);
                      return (
                        <button
                          key={flag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setCorrectionFlags(correctionFlags.filter((f) => f !== flag));
                            } else {
                              setCorrectionFlags([...correctionFlags, flag]);
                            }
                          }}
                          className={`rounded-lg border p-2 text-[10px] font-semibold text-left transition-colors cursor-pointer ${
                            isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border hover:bg-muted'
                          }`}
                        >
                          {flag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={() => handleVerify('APPROVED')} isLoading={submittingAction} className="flex-1">
                    <CheckSquare className="h-4 w-4" /> Approve
                  </Button>
                  <Button onClick={() => handleVerify('REJECTED')} variant="destructive" isLoading={submittingAction} className="flex-1">
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRequestCorrections} variant="outline" isLoading={submittingAction} className="flex-1">
                    <Send className="h-3.5 w-3.5" /> Request Edits
                  </Button>
                  <Button onClick={handleSuspend} variant="ghost" isLoading={submittingAction} className="flex-1 border border-border text-amber-500 hover:bg-amber-500/10">
                    <AlertTriangle className="h-3.5 w-3.5" /> Suspend
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground space-y-2 sticky top-24">
              <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-bold text-sm text-foreground">Verify Property Submissions</h4>
              <p className="text-xs">Select a listing to review amenities, room setups, mapping, and approve/reject permissions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyVerificationCenter;
