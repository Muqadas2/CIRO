import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { checkHealth, getBaseUrl, setBaseUrl } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [backendStatus, setBackendStatus] = useState('checking');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Check backend
    checkBackend();
  }, []);

  const checkBackend = async () => {
    setBackendStatus('checking');
    const result = await checkHealth();
    setBackendStatus(result.connected ? 'connected' : 'disconnected');
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return Colors.success;
      case 'disconnected': return Colors.danger;
      default: return Colors.warning;
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Backend Online';
      case 'disconnected': return 'Backend Offline';
      default: return 'Checking...';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <LinearGradient
        colors={[Colors.background, '#0F172A', Colors.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow effect */}
      <Animated.View style={[styles.ambientGlow, {
        opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.25] })
      }]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Logo & Title */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={[Colors.primaryStart, Colors.primaryEnd]}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Ionicons name="shield-checkmark" size={32} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.title}>CIRO</Text>
        <Text style={styles.subtitle}>Crisis Intelligence &{'\n'}Response Orchestrator</Text>
        <Text style={styles.tagline}>AI-Powered • Multi-Agent • Real-Time</Text>

        {/* Backend status indicator */}
        <TouchableOpacity style={styles.statusBadge} onPress={checkBackend}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
          <Ionicons name="refresh" size={14} color={Colors.textMuted} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('ReportCrisis')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.danger, '#DC2626']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name="warning" size={24} color="#fff" />
              <View style={styles.buttonTextGroup}>
                <Text style={styles.buttonTitle}>Report Crisis</Text>
                <Text style={styles.buttonSubtitle}>Submit emergency signal</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primaryStart, Colors.primaryEnd]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name="grid" size={24} color="#fff" />
              <View style={styles.buttonTextGroup}>
                <Text style={styles.buttonTitle}>Command Center</Text>
                <Text style={styles.buttonSubtitle}>View dashboard & agent logs</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Incidents' })}
            activeOpacity={0.8}
          >
            <View style={styles.tertiaryInner}>
              <Ionicons name="time" size={22} color={Colors.accentStart} />
              <View style={styles.buttonTextGroup}>
                <Text style={[styles.buttonTitle, { color: Colors.textPrimary }]}>Past Incidents</Text>
                <Text style={styles.buttonSubtitle}>View history & traces</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Powered by Google Gemini • Antigravity</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  ambientGlow: {
    position: 'absolute', top: -100, left: width / 2 - 150,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: Colors.primaryStart,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  logoContainer: { marginBottom: 20 },
  logoGradient: {
    width: 64, height: 64, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primaryStart, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 16,
  },
  title: {
    fontSize: 34, fontWeight: '800', color: Colors.textPrimary,
    letterSpacing: 6, marginBottom: 4,
  },
  subtitle: {
    fontSize: 16, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 24, marginBottom: 6,
  },
  tagline: {
    fontSize: 12, color: Colors.textMuted, letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceGlass, paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 13, fontWeight: '600' },
  buttonContainer: { width: '100%', gap: 10 },
  primaryButton: { borderRadius: 16, overflow: 'hidden', elevation: 8 },
  secondaryButton: { borderRadius: 16, overflow: 'hidden', elevation: 6 },
  tertiaryButton: {
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  buttonGradient: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  tertiaryInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: Colors.surface,
  },
  buttonTextGroup: { flex: 1, marginLeft: 14 },
  buttonTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  buttonSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  footer: {
    position: 'absolute', bottom: 10,
    fontSize: 10, color: Colors.textMuted, letterSpacing: 1,
  },
});
