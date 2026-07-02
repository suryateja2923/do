import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, StatusBadge, useThemeColors } from '@/shared';
import { Spacing } from '@/constants/theme';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import { FileText as IconFileText, ShieldAlert as IconShieldAlert, Download as IconDownload, Info as IconInfo } from 'lucide-react-native';
const FileText = IconFileText as any;
const ShieldAlert = IconShieldAlert as any;
const Download = IconDownload as any;
const Info = IconInfo as any;

export default function ReportsScreen() {
  const colors = useThemeColors();
  const [selectedReport, setSelectedReport] = useState<string>('OCCUPANCY');

  const reportOptions = [
    { key: 'OCCUPANCY', label: 'Occupancy Ratio Logs', description: 'Lists property room capacities, checked-in residents count and vacant beds.' },
    { key: 'ROOM_AVAILABILITY', label: 'Room Availability Checklist', description: 'Lists rooms designated AC/Non-AC status, sharing sizes, and pricing configurations.' },
    { key: 'COMPLAINTS', label: 'Complaint Tickets History', description: 'Lists maintenance tickets category levels, priority status and assigned staff.' },
  ];

  const handleExportCSV = async () => {
    try {
      const response: any = await apiClient.get(`${API_ENDPOINTS.REPORTS.QUERY}?category=${selectedReport}`);
      const rows = Array.isArray(response?.data) ? response.data : [];

      if (!rows.length) {
        Alert.alert('No Data', `No records found for ${selectedReport.replace('_', ' ')}.`);
        return;
      }

      const headers = Object.keys(rows[0]);
      const csvContent = [
        headers.join(','),
        ...rows.map((row: Record<string, unknown>) =>
          headers
            .map((key) => {
              const value = row[key];
              const escaped = String(value ?? '').replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(',')
        ),
      ].join('\n');

      console.log('Exporting CSV:\n', csvContent);
      Alert.alert(
        'Export Successful',
        `CSV file generated for ${selectedReport.replace('_', ' ')} from live database records.`,
        [{ text: 'Ok' }]
      );
    } catch {
      Alert.alert('Export Failed', 'Server rejected report generation request.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scroll}>
      {/* Financial isolation warning */}
      <View style={styles.warningBanner}>
        <ShieldAlert color="#ef4444" size={16} />
        <Text style={styles.warningText}>
          Financial accounting (Invoices, transaction history, platform revenues) is isolated from owners here.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Operational Categories</Text>
      <View style={styles.list}>
        {reportOptions.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setSelectedReport(opt.key)}
            activeOpacity={0.8}
          >
            <Card
              style={[
                styles.reportCard,
                {
                  borderColor: selectedReport === opt.key ? '#6366f1' : 'transparent',
                  borderWidth: selectedReport === opt.key ? 1.5 : 0,
                },
              ]}
            >
              <View style={styles.row}>
                <FileText color="#6366f1" size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reportLabel, { color: colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.reportDesc, { color: colors.textSecondary }]}>{opt.description}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action export btn */}
      <Button
        title="Export Selected Report to CSV"
        onPress={handleExportCSV}
        style={styles.exportBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: 40,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    borderColor: 'rgba(239, 68, 68, 0.13)',
    borderWidth: 1,
    padding: Spacing.three,
    borderRadius: 14,
    gap: Spacing.two,
    alignItems: 'center',
  },
  warningText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
    lineHeight: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: Spacing.two,
  },
  reportCard: {
    padding: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  reportLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  reportDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  exportBtn: {
    backgroundColor: '#6366f1',
    marginTop: Spacing.two,
  },
});
