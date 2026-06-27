import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  SafeAreaView, Alert,
} from 'react-native';
import { COLORS, DEMO_UPIS } from '../constants/theme';
import { checkUpi } from '../services/api';

export default function HomeScreen({ onResult }) {
  const [upiId,   setUpiId]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleScan(id) {
    const target = (id || upiId).trim();
    if (!target) {
      Alert.alert('Missing UPI ID', 'Please enter or select a UPI ID.');
      return;
    }
    if (!target.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Format should be name@bank  e.g. vikram.s1@ybl');
      return;
    }

    setLoading(true);
    try {
      const result = await checkUpi(target);
      onResult({ data: result, upiId: target });
    } catch (err) {
      onResult({ data: null, upiId: target, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  function selectDemo(upi) {
    setUpiId(upi);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>⬡ NEXUS</Text>
          <Text style={styles.subtitle}>UPI Fraud Detection</Text>
          <View style={styles.tagRow}>
            <Text style={styles.tag}>Powered by Graph Intelligence</Text>
          </View>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Enter UPI ID to Scan</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. vikram.s1@ybl"
            placeholderTextColor={COLORS.textSecondary}
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.scanBtn, loading && styles.scanBtnDisabled]}
            onPress={() => handleScan(null)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.scanBtnText}>🔍  Scan & Check</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Demo Buttons */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Quick Demo — Tap to Test</Text>
          {DEMO_UPIS.map((item) => {
            const dotColor =
              item.risk === 'SAFE'     ? COLORS.green  :
              item.risk === 'CRITICAL' ? COLORS.red    :
                                        COLORS.orange;
            return (
              <TouchableOpacity
                key={item.upi}
                style={[styles.demoBtn, loading && styles.demoBtnDisabled]}
                onPress={() => { selectDemo(item.upi); handleScan(item.upi); }}
                disabled={loading}
                activeOpacity={0.7}
              >
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                <Text style={styles.demoBtnText}>{item.label}</Text>
                <Text style={[styles.demoRisk, { color: dotColor }]}>
                  {item.risk}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          GraphGuard · Neo4j AuraDB · Real-time Protection
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding:    20,
    paddingTop: 40,
  },
  header: {
    alignItems:   'center',
    marginBottom:  32,
  },
  logo: {
    fontSize:      36,
    fontWeight:   '900',
    color:         COLORS.accent,
    letterSpacing:  4,
  },
  subtitle: {
    fontSize:     14,
    color:        COLORS.textSecondary,
    marginTop:     4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tagRow: {
    marginTop:       10,
    backgroundColor: '#1A1A3A',
    borderRadius:     20,
    paddingHorizontal:12,
    paddingVertical:   4,
  },
  tag: {
    color:    COLORS.accent,
    fontSize: 11,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    16,
    padding:         20,
    marginBottom:    16,
    borderWidth:      1,
    borderColor:     COLORS.cardBorder,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:    0.3,
    shadowRadius:     8,
    elevation:        6,
  },
  cardLabel: {
    color:        COLORS.textSecondary,
    fontSize:     12,
    marginBottom:  12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth:      1,
    borderColor:     COLORS.inputBorder,
    borderRadius:    10,
    color:           COLORS.textPrimary,
    fontSize:        15,
    padding:         14,
    marginBottom:    14,
  },
  scanBtn: {
    backgroundColor: COLORS.accent,
    borderRadius:    12,
    padding:         16,
    alignItems:      'center',
  },
  scanBtnDisabled: {
    opacity: 0.5,
  },
  scanBtnText: {
    color:      COLORS.white,
    fontSize:   16,
    fontWeight: '700',
  },
  demoBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.inputBg,
    borderRadius:    10,
    padding:         12,
    marginBottom:     8,
    borderWidth:      1,
    borderColor:     COLORS.inputBorder,
  },
  demoBtnDisabled: {
    opacity: 0.4,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    marginRight:  10,
  },
  demoBtnText: {
    color:    COLORS.textPrimary,
    fontSize: 13,
    flex:     1,
  },
  demoRisk: {
    fontSize:   11,
    fontWeight: '700',
  },
  footer: {
    textAlign:    'center',
    color:        COLORS.textSecondary,
    fontSize:     11,
    marginTop:    8,
    marginBottom: 20,
  },
});
