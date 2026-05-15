import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

function SeverityBadge({ severity }) {
  const color = {
    CRITICAL: Colors.severityCritical, HIGH: Colors.severityHigh,
    MEDIUM: Colors.severityMedium, LOW: Colors.severityLow,
  }[severity?.toUpperCase()] || Colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{severity?.toUpperCase() || 'UNKNOWN'}</Text>
    </View>
  );
}

function AgentStep({ step, title, subtitle, status, delay }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.agentStep, { opacity: fadeAnim }]}>
      <View style={[styles.stepNumber, status === 'done' && styles.stepDone]}>
        {status === 'done' ? <Ionicons name="checkmark" size={14} color="#fff" /> : <Text style={styles.stepNumText}>{step}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSub}>{subtitle}</Text>
      </View>
    </Animated.View>
  );
}

export default function DashboardScreen({ route, navigation }) {
  const crisisResult = route?.params?.crisisResult;
  const signals = route?.params?.signals || [];
  const [activeTab, setActiveTab] = useState('overview');

  const classification = crisisResult?.classification || {};
  const prediction = crisisResult?.prediction || {};
  const allocation = crisisResult?.allocation || {};
  const simulation = crisisResult?.simulation || {};
  const signalFusion = crisisResult?.signal_fusion || {};
  const notification = crisisResult?.notification || {};

  const crisisType = classification?.crisis_type || classification?.type || 'Unknown Crisis';
  const severity = classification?.severity || prediction?.severity_level || 'UNKNOWN';
  const confidence = classification?.confidence?.overall_confidence || classification?.confidence || 'N/A';
  const affectedZone = classification?.affected_zone?.zone_name || classification?.affected_zone?.address || 'Unknown';
  const simulatedActions = simulation?.simulated_actions || [];
  const overallSummary = simulation?.overall_simulation_summary || {};

  if (!crisisResult) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient colors={[Colors.background, '#0F172A']} style={StyleSheet.absoluteFill} />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeBtn}>
            <Ionicons name="home" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyContent}>
          <Ionicons name="analytics" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Active Crisis</Text>
          <Text style={styles.emptySub}>Submit a crisis report to see AI analysis here.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, '#0F172A']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeBtn}>
          <Ionicons name="home" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Card */}
        <LinearGradient colors={[Colors.danger + '20', Colors.background]} style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.typeIcon}><Ionicons name="warning" size={28} color={Colors.danger} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.crisisType}>{crisisType}</Text>
              <Text style={styles.crisisLoc}><Ionicons name="location" size={13} color={Colors.textMuted} /> {affectedZone}</Text>
            </View>
            <SeverityBadge severity={severity} />
          </View>
          <View style={styles.metricsRow}>
            {[
              { icon: 'analytics', label: 'Confidence', value: typeof confidence === 'number' ? `${(confidence * 100).toFixed(0)}%` : String(confidence), color: Colors.primaryStart },
              { icon: 'pulse', label: 'Severity', value: severity, color: Colors.danger },
            ].map((m, i) => (
              <View key={i} style={styles.metricCard}>
                <Ionicons name={m.icon} size={18} color={m.color} />
                <Text style={styles.metricVal}>{m.value}</Text>
                <Text style={styles.metricLbl}>{m.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {['overview', 'simulation', 'agents'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {activeTab === 'overview' && (
            <>
              <Text style={styles.secTitle}>Fused Signals ({(signalFusion?.fused_signals || signals).length})</Text>
              {(signalFusion?.fused_signals || signals).map((sig, i) => (
                <View key={i} style={styles.sigCard}>
                  <View style={styles.sigHeader}>
                    <Ionicons name={sig.source === 'weather_api' ? 'cloud' : sig.source === 'traffic_map' ? 'car' : 'chatbubble'} size={14} color={Colors.primaryStart} />
                    <Text style={styles.sigSource}>{sig.source?.replace(/_/g, ' ').toUpperCase()}</Text>
                  </View>
                  <Text style={styles.sigText} numberOfLines={3}>{sig.text}</Text>
                </View>
              ))}
            </>
          )}

          {activeTab === 'simulation' && (
            <>
              <Text style={styles.secTitle}>Simulated Actions</Text>
              {simulatedActions.length > 0 ? simulatedActions.map((a, i) => (
                <View key={i} style={styles.simCard}>
                  <View style={styles.simHeader}>
                    <LinearGradient colors={[Colors.success, Colors.accentStart]} style={styles.simIcon}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.simAction}>{a.action || `Action ${i+1}`}</Text>
                  </View>
                  {a.before_state && (
                    <View style={styles.stateRow}>
                      <View style={[styles.stateBox, {borderColor: Colors.danger+'40'}]}>
                        <Text style={[styles.stateLbl, {color: Colors.danger}]}>BEFORE</Text>
                        <Text style={styles.stateTxt}>{typeof a.before_state === 'string' ? a.before_state : Object.entries(a.before_state).map(([k,v])=>`${k}: ${v}`).join('\n')}</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
                      <View style={[styles.stateBox, {borderColor: Colors.success+'40'}]}>
                        <Text style={[styles.stateLbl, {color: Colors.success}]}>AFTER</Text>
                        <Text style={styles.stateTxt}>{typeof a.after_state_estimated === 'string' ? a.after_state_estimated : Object.entries(a.after_state_estimated||{}).map(([k,v])=>`${k}: ${v}`).join('\n')}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )) : <View style={styles.card}><Text style={styles.noData}>Simulation data in agent trace</Text></View>}
              {overallSummary.expected_outcome && (
                <View style={styles.summaryCard}>
                  <Ionicons name="trophy" size={22} color={Colors.success} />
                  <Text style={styles.summaryTitle}>Expected Outcome</Text>
                  <Text style={styles.summaryText}>{overallSummary.expected_outcome}</Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'agents' && (
            <>
              <Text style={styles.secTitle}>Agent Pipeline</Text>
              {[
                { step:1, title:'Signal Fusion Agent', subtitle:'Normalized signals', status: signalFusion ? 'done':'pending' },
                { step:2, title:'Crisis Classifier Agent', subtitle:'Identified crisis type', status: classification ? 'done':'pending' },
                { step:3, title:'Severity Prediction Agent', subtitle:'Estimated severity', status: prediction ? 'done':'pending' },
                { step:4, title:'Resource Allocator Agent', subtitle:'Assigned resources', status: allocation ? 'done':'pending' },
                { step:5, title:'Action Simulator Agent', subtitle:'Simulated outcomes', status: simulation ? 'done':'pending' },
                { step:6, title:'Notifier Agent', subtitle:'Generated alerts', status: notification ? 'done':'pending' },
              ].map((a,i)=> <AgentStep key={i} {...a} delay={i*200} />)}
              <View style={styles.jsonBox}>
                <Text style={styles.jsonTitle}>Raw Trace Output</Text>
                <Text style={styles.jsonText}>{JSON.stringify(crisisResult, null, 2)?.substring(0, 1500)}</Text>
              </View>
            </>
          )}
        </View>
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
  emptyContainer: { flex: 1, backgroundColor: Colors.background },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
  headerCard: { margin: 16, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.danger + '20' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  typeIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.dangerSoft, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  crisisType: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  crisisLoc: { fontSize: 13, color: Colors.textMuted, marginTop: 3 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  metricVal: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 6 },
  metricLbl: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  tabBar: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 14, padding: 4, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.primaryStart + '20' },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.primaryStart },
  secTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 10 },
  card: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  noData: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  sigCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  sigHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sigSource: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginLeft: 8 },
  sigText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  simCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  simHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  simIcon: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  simAction: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  stateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stateBox: { flex: 1, backgroundColor: Colors.card, borderRadius: 10, padding: 10, borderWidth: 1 },
  stateLbl: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  stateTxt: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },
  summaryCard: { borderRadius: 16, padding: 20, marginTop: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.success + '30', backgroundColor: Colors.success + '08' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: Colors.success, marginTop: 8 },
  summaryText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  agentStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  stepNumber: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepDone: { backgroundColor: Colors.success },
  stepNumText: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  stepTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  stepSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  jsonBox: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: Colors.border },
  jsonTitle: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginBottom: 8 },
  jsonText: { fontSize: 10, color: Colors.accentStart, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 15 },
});
