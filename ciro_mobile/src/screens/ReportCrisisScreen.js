import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { submitCrisisReport } from '../services/api';

const CRISIS_TYPES = [
  { id: 'flooding', label: 'Urban Flooding', icon: 'water', color: '#3B82F6' },
  { id: 'heatwave', label: 'Heatwave', icon: 'sunny', color: '#F59E0B' },
  { id: 'accident', label: 'Road Accident', icon: 'car', color: '#EF4444' },
  { id: 'fire', label: 'Fire', icon: 'flame', color: '#F97316' },
  { id: 'infrastructure', label: 'Infrastructure', icon: 'construct', color: '#8B5CF6' },
  { id: 'other', label: 'Other', icon: 'alert-circle', color: '#6B7280' },
];

const PRESET_SIGNALS = [
  "Flash flood happening at George Town for past 30 mins",
  "G-10 mein pani bhar gaya hai, gaariyan phans gayi hain",
  "Heavy smoke visible from factory in industrial zone",
  "Major road accident on GT Road near Peshawar, traffic blocked",
  "Extreme heat in southern districts, people fainting on streets",
];

export default function ReportCrisisScreen({ navigation }) {
  const [reportText, setReportText] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      Alert.alert('Missing Report', 'Please enter a crisis description.');
      return;
    }

    setIsSubmitting(true);

    // Build signal array matching backend format
    const signals = [
      {
        source: 'citizen_report',
        text: reportText,
        timestamp: new Date().toISOString(),
        credibility_indicator: 'direct citizen mobile report, unverified',
      },
    ];

    // Add simulated supporting signals based on crisis type
    if (selectedType === 'flooding') {
      signals.push(
        {
          source: 'weather_api',
          text: `Heavy rainfall warning active for ${location || 'reported area'}. 85mm expected in next 2 hours.`,
          timestamp: new Date().toISOString(),
          credibility_indicator: 'official_weather_forecast, high accuracy',
        },
        {
          source: 'traffic_map',
          text: `Severe congestion spike detected near ${location || 'reported area'}. Multiple vehicles rerouting.`,
          timestamp: new Date().toISOString(),
          credibility_indicator: 'crowd_sourced_traffic_data, medium accuracy',
        }
      );
    } else if (selectedType === 'fire') {
      signals.push({
        source: 'emergency_call',
        text: `Multiple callers reporting smoke and flames near ${location || 'reported area'}.`,
        timestamp: new Date().toISOString(),
        credibility_indicator: 'emergency_call, medium credibility',
      });
    } else if (selectedType === 'accident') {
      signals.push({
        source: 'traffic_map',
        text: `Traffic completely stopped at ${location || 'reported area'}. Possible road obstruction.`,
        timestamp: new Date().toISOString(),
        credibility_indicator: 'crowd_sourced_traffic_data, medium accuracy',
      });
    } else if (selectedType === 'heatwave') {
      signals.push({
        source: 'weather_api',
        text: `Temperature spike to 48°C in ${location || 'reported area'}. Severe heat warning active.`,
        timestamp: new Date().toISOString(),
        credibility_indicator: 'official_weather_forecast, high accuracy',
      });
    }

    try {
      const result = await submitCrisisReport(signals);
      navigation.navigate('MainTabs', {
        screen: 'Dashboard',
        params: { crisisResult: result, signals: signals },
      });
    } catch (error) {
      Alert.alert(
        'Connection Error',
        `Could not reach the CIRO backend.\n\nMake sure the backend is running at the configured URL.\n\nError: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.background, '#0F172A']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Report Crisis</Text>
          <Text style={styles.headerSubtitle}>Submit a crisis signal to CIRO</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

          {/* Crisis Type Selector */}
          <Text style={styles.sectionLabel}>Crisis Type</Text>
          <View style={styles.typeGrid}>
            {CRISIS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeChip,
                  selectedType === type.id && { borderColor: type.color, backgroundColor: type.color + '20' },
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={selectedType === type.id ? type.color : Colors.textMuted}
                />
                <Text style={[
                  styles.typeLabel,
                  selectedType === type.id && { color: type.color },
                ]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Location */}
          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color={Colors.primaryStart} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. G-10 Islamabad, George Town Peshawar"
              placeholderTextColor={Colors.textMuted}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Report Text */}
          <View style={styles.labelRow}>
            <Text style={styles.sectionLabel}>Describe the Crisis</Text>
            <TouchableOpacity onPress={() => setShowPresets(!showPresets)}>
              <Text style={styles.presetToggle}>
                {showPresets ? 'Hide' : 'Quick Fill'} ▾
              </Text>
            </TouchableOpacity>
          </View>

          {showPresets && (
            <View style={styles.presetContainer}>
              {PRESET_SIGNALS.map((preset, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.presetChip}
                  onPress={() => { setReportText(preset); setShowPresets(false); }}
                >
                  <Text style={styles.presetText} numberOfLines={1}>"{preset}"</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what you see... (supports English, Urdu, Roman Urdu)"
              placeholderTextColor={Colors.textMuted}
              value={reportText}
              onChangeText={setReportText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Info card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={18} color={Colors.accentStart} />
            <Text style={styles.infoText}>
              CIRO will automatically add simulated weather, traffic, and sensor data to enrich your signal for the multi-agent analysis.
            </Text>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isSubmitting ? [Colors.textMuted, Colors.textMuted] : [Colors.danger, '#DC2626']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.submitText}>CIRO Agents Processing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.submitText}>Send to CIRO</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 14, fontWeight: '600', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  presetToggle: { fontSize: 13, color: Colors.primaryStart, fontWeight: '600', marginTop: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  typeLabel: { fontSize: 13, color: Colors.textSecondary, marginLeft: 8, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15, paddingVertical: 14 },
  textAreaContainer: { alignItems: 'flex-start', marginTop: 10 },
  textArea: { minHeight: 120, paddingTop: 14 },
  presetContainer: { gap: 8, marginBottom: 10 },
  presetChip: {
    backgroundColor: Colors.surfaceLight, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
  },
  presetText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.infoSoft,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginTop: 16,
    borderWidth: 1, borderColor: Colors.primaryStart + '30',
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.textSecondary, marginLeft: 10, lineHeight: 19 },
  submitBtn: { marginTop: 24, borderRadius: 16, overflow: 'hidden', elevation: 8 },
  submitDisabled: { opacity: 0.7 },
  submitGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, gap: 10,
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
