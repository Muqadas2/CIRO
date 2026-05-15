import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getIncidents } from '../services/api';

export default function IncidentsScreen({ navigation }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncidents = async () => {
    try {
      setError(null);
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchIncidents(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchIncidents(); };

  const getSeverityColor = (s) => ({
    CRITICAL: Colors.severityCritical, HIGH: Colors.severityHigh,
    MEDIUM: Colors.severityMedium, LOW: Colors.severityLow,
  }[s?.toUpperCase()] || Colors.textMuted);

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient colors={[Colors.background, '#0F172A']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={Colors.primaryStart} />
        <Text style={styles.loadingText}>Loading incidents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, '#0F172A']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Incidents</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeBtn}>
          <Ionicons name="home" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryStart} />}
      >
        <Text style={styles.subtitle}>{incidents.length} incidents recorded</Text>

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="cloud-offline" size={18} color={Colors.danger} />
            <Text style={styles.errorText}>Cannot reach backend: {error}</Text>
          </View>
        )}

        {incidents.length === 0 && !error && (
          <View style={styles.emptyCard}>
            <Ionicons name="file-tray" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No incidents yet.{'\n'}Submit a crisis report to get started.</Text>
          </View>
        )}

        {incidents.map((inc, i) => (
          <View key={i} style={styles.incidentCard}>
            <View style={styles.incidentHeader}>
              <View style={[styles.sevDot, { backgroundColor: getSeverityColor(inc.severity) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.incType}>{inc.type || 'Unknown'}</Text>
                <Text style={styles.incId}>{inc.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: inc.status === 'ACTIVE' ? Colors.success + '20' : Colors.textMuted + '20' }]}>
                <Text style={[styles.statusText, { color: inc.status === 'ACTIVE' ? Colors.success : Colors.textMuted }]}>
                  {inc.status || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.incDetails}>
              {inc.severity && (
                <View style={styles.detailRow}>
                  <Ionicons name="alert-circle" size={14} color={getSeverityColor(inc.severity)} />
                  <Text style={styles.detailText}>Severity: {inc.severity}</Text>
                </View>
              )}
              {inc.confidence && (
                <View style={styles.detailRow}>
                  <Ionicons name="analytics" size={14} color={Colors.primaryStart} />
                  <Text style={styles.detailText}>Confidence: {typeof inc.confidence === 'number' ? `${(inc.confidence * 100).toFixed(0)}%` : inc.confidence}</Text>
                </View>
              )}
              {inc.created_at && (
                <View style={styles.detailRow}>
                  <Ionicons name="time" size={14} color={Colors.textMuted} />
                  <Text style={styles.detailText}>{new Date(inc.created_at).toLocaleString()}</Text>
                </View>
              )}
            </View>

            {inc.signals && inc.signals.length > 0 && (
              <View style={styles.signalsSection}>
                <Text style={styles.signalsLabel}>Signals ({inc.signals.length})</Text>
                {inc.signals.map((sig, j) => (
                  <View key={j} style={styles.signalRow}>
                    <Text style={styles.signalSource}>{sig.source}</Text>
                    <Text style={styles.signalContent} numberOfLines={2}>{sig.content}</Text>
                  </View>
                ))}
              </View>
            )}

            {inc.allocations && inc.allocations.length > 0 && (
              <View style={styles.allocSection}>
                <Text style={styles.signalsLabel}>Resources</Text>
                <View style={styles.allocRow}>
                  {inc.allocations.map((a, k) => (
                    <View key={k} style={styles.allocChip}>
                      <Text style={styles.allocChipText}>{a.resource_type} ×{a.quantity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  homeBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { color: Colors.textMuted, marginTop: 12, fontSize: 14 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 20 },
  errorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dangerSoft, padding: 14, borderRadius: 12, marginBottom: 16, gap: 10 },
  errorText: { flex: 1, color: Colors.danger, fontSize: 13 },
  emptyCard: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 22 },
  incidentCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  incidentHeader: { flexDirection: 'row', alignItems: 'center' },
  sevDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  incType: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  incId: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  incDetails: { marginTop: 12, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: Colors.textSecondary },
  signalsSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  signalsLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  signalRow: { marginBottom: 6 },
  signalSource: { fontSize: 11, fontWeight: '600', color: Colors.primaryStart },
  signalContent: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  allocSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  allocRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allocChip: { backgroundColor: Colors.accentStart + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  allocChipText: { fontSize: 12, fontWeight: '600', color: Colors.accentStart },
});
