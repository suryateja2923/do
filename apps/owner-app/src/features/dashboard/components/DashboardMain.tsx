import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/useShared';
import { DashboardService } from '../services/dashboardService';
import {
  Building as IconBuilding,
  Bed as IconBed,
  CalendarCheck as IconCalendarCheck,
  AlertTriangle as IconAlertTriangle,
  PlusCircle as IconPlusCircle,
  BarChart as IconBarChart,
  History as IconHistory,
  FileText as IconFileText,
} from 'lucide-react-native';
const Building = IconBuilding as any;
const Bed = IconBed as any;
const CalendarCheck = IconCalendarCheck as any;
const AlertTriangle = IconAlertTriangle as any;
const PlusCircle = IconPlusCircle as any;
const BarChart = IconBarChart as any;
const History = IconHistory as any;
const FileText = IconFileText as any;

export const DashboardMain: React.FC = () => {
  const colors = useThemeColors();
  const router = useRouter();
  
  const { data: stats, loading, execute: refetch } = useApi(DashboardService.getStats, true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const totals = stats?.totals || {
    properties: 0,
    floors: 0,
    rooms: 0,
    beds: 0,
    occupiedBeds: 0,
    vacantBeds: 0,
    reservedBeds: 0,
    pendingVerificationProperties: 0,
    verifiedProperties: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    activeTenants: 0,
    vacatedTenants: 0,
    openComplaints: 0,
    resolvedComplaints: 0,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366f1" />
      }
    >
      {/* 1. Welcoming Title */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Real-time PG Business Operations
        </Text>
      </View>

      {/* 2. Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          onPress={() => router.push('/properties/add')}
          style={[styles.actionBtn, { backgroundColor: colors.backgroundElement }]}
        >
          <PlusCircle color="#6366f1" size={24} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Add Property</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/reports')}
          style={[styles.actionBtn, { backgroundColor: colors.backgroundElement }]}
        >
          <FileText color="#6366f1" size={24} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Onboarding Checklist */}
      {totals.properties === 0 ? (
        <Card style={[styles.onboardingCard, { borderColor: '#6366f1', borderWidth: 1.5 }]}>
          <Text style={[styles.onboardingTitle, { color: colors.text }]}>🚀 Complete Your Onboarding</Text>
          <Text style={[styles.onboardingDesc, { color: colors.textSecondary }]}>
            You are successfully verified! Follow these remaining steps to start managing your PG business:
          </Text>

          <View style={styles.checklist}>
            <View style={styles.checkItem}>
              <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 16 }}>✓ </Text>
              <Text style={[styles.checkLabel, { color: colors.text, textDecorationLine: 'line-through' }]}>
                Register business account
              </Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 16 }}>✓ </Text>
              <Text style={[styles.checkLabel, { color: colors.text, textDecorationLine: 'line-through' }]}>
                Obtain KYC validation from Managers
              </Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 16 }}>○ </Text>
              <Text style={[styles.checkLabel, { color: colors.text, fontWeight: '700' }]}>
                Add your first PG property listing
              </Text>
            </View>
          </View>

          <Button
            title="Create First Property Listing"
            onPress={() => router.push('/properties/add')}
            style={{ marginTop: Spacing.two }}
          />
        </Card>
      ) : null}

      {/* 3. KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        <Card style={styles.kpiCard}>
          <Building color="#6366f1" size={20} />
          <Text style={styles.kpiValue}>{totals.properties}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Properties</Text>
        </Card>

        <Card style={styles.kpiCard}>
          <Bed color="#10b981" size={20} />
          <Text style={styles.kpiValue}>{totals.occupiedBeds}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Occupied Beds</Text>
        </Card>

        <Card style={styles.kpiCard}>
          <CalendarCheck color="#3b82f6" size={20} />
          <Text style={styles.kpiValue}>{totals.pendingBookings}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>New Bookings</Text>
        </Card>

        <Card style={styles.kpiCard}>
          <AlertTriangle color="#ef4444" size={20} />
          <Text style={styles.kpiValue}>{totals.openComplaints}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Open Complaints</Text>
        </Card>
      </View>

      {/* 4. Occupancy Indicators (Custom Visual Charts) */}
      <Card style={styles.chartSection}>
        <View style={styles.sectionHeader}>
          <BarChart color="#6366f1" size={18} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Beds Occupancy Ratio</Text>
        </View>

        <View style={styles.occupancyBarContainer}>
          <View style={styles.occupancyBarLabelRow}>
            <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Occupancy Ratio</Text>
            <Text style={[styles.barPercent, { color: colors.text }]}>
              {totals.beds > 0 ? Math.round((totals.occupiedBeds / totals.beds) * 100) : 0}%
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.backgroundSelected }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${totals.beds > 0 ? (totals.occupiedBeds / totals.beds) * 100 : 0}%`,
                },
              ]}
            />
          </View>
          <View style={styles.legendRow}>
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {totals.occupiedBeds} Occupied
            </Text>
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {totals.vacantBeds} Vacant
            </Text>
          </View>
        </View>
      </Card>

      {/* 5. Recent Activity Logs */}
      <Card style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <History color="#6366f1" size={18} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activities</Text>
        </View>

        <View style={styles.activityList}>
          {stats?.recentActivities.map((act) => (
            <View key={act.id} style={styles.activityItem}>
              <View style={styles.activityIndicatorDot} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityItemTitle, { color: colors.text }]}>{act.title}</Text>
                <Text style={[styles.activityItemDesc, { color: colors.textSecondary }]}>
                  {act.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionBtn: {
    flex: 1,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.three,
    borderRadius: 16,
    gap: Spacing.half,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#6366f1',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  chartSection: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  occupancyBarContainer: {
    gap: Spacing.two,
  },
  occupancyBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  barPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.half,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activitySection: {
    gap: Spacing.three,
  },
  activityList: {
    gap: Spacing.three,
  },
  activityItem: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  activityIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginTop: 6,
  },
  activityItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  activityItemDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 1,
  },
  onboardingCard: {
    padding: Spacing.four,
    gap: Spacing.three,
    borderRadius: 16,
    marginBottom: Spacing.three,
  },
  onboardingTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  onboardingDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  checklist: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkLabel: {
    fontSize: 13,
  },
});
export default DashboardMain;
