import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, SafeAreaView, Alert,
} from 'react-native';
import { COLORS } from '../constants/theme';
import RiskBadge        from '../components/RiskBadge';
import LinkedAccountCard from '../components/LinkedAccountCard';

export default function ResultScreen({ result, upiId, error, onScanAnother }) {

  // ── Offline / error state ──────────────────────────────────────────────────
  if (error || !result) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.screenTitle}>⬡ NEXUS</Text>
          <View style={[styles.card, styles.grayCard]}>
            <Text style={styles.offlineIcon}>📡</Text>
            <Text style={styles.offlineTitle}>Server Offline</Text>
            <Text style={styles.offlineMsg}>
              Could not reach the Nexus backend.{'\n'}Please check your connection and try again.
            </Text>
            {error && <Text style={styles.errorDetail}>{error}</Text>}
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={onScanAnother}>
            <Text style={styles.backBtnText}>← Scan Another</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const { isFraud, riskLevel, riskScore, name, warning, message, reasons, linkedAccounts } = result;

  // ── Theme per risk level ───────────────────────────────────────────────────
  const theme =
    !isFraud
      ? { bg: COLORS.greenBg,  border: COLORS.green,  accent: COLORS.green,  icon: '✅' }
      : riskLevel === 'CRITICAL'
      ? { bg: COLORS.redBg,    border: COLORS.red,    accent: COLORS.red,    icon: '🚨' }
      : { bg: COLORS.orangeBg, border: COLORS.orange, accent: COLORS.orange, icon: '⚠️' };

  // ── Action button ──────────────────────────────────────────────────────────
  const actionLabel =
    !isFraud          ? 'Pay Now'          :
    riskLevel === 'CRITICAL' ? 'Block & Report' :
                               'Proceed Carefully';

  const actionColor =
    !isFraud          ? COLORS.green  :
    riskLevel === 'CRITICAL' ? COLORS.red    :
                               COLORS.orange;

  function handleAction() {
    if (!isFraud) {
      Alert.alert('Redirecting…', 'Opening your UPI app to complete the payment.');
    } else if (riskLevel === 'CRITICAL') {
      Alert.alert('Blocked & Reported', `${upiId} has been reported to the fraud database.`);
    } else {
      Alert.alert('Caution', 'You chose to proceed. Stay alert and verify the recipient.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.screenTitle}>⬡ NEXUS</Text>
        <Text style={styles.screenSubtitle}>Scan Result</Text>

        {/* Main result card */}
        <View style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}>

          {/* Header row */}
          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>{theme.icon}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.resultLevel, { color: theme.accent }]}>
                {isFraud ? riskLevel : 'SAFE'}
              </Text>
              <Text style={styles.resultName}>{name || upiId}</Text>
              <Text style={styles.resultUpi}>{upiId}</Text>
            </View>
            {riskScore != null && <RiskBadge score={riskScore} />}
          </View>

          {/* Warning / safe message */}
          <View style={styles.divider} />
          <Text style={[styles.warningText, { color: theme.accent }]}>
            {warning || message}
          </Text>

          {/* Reasons */}
          {reasons && reasons.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detection Reasons</Text>
              {reasons.map((r, i) => (
                <View key={i} style={styles.reasonRow}>
                  <Text style={[styles.bullet, { color: theme.accent }]}>▸</Text>
                  <Text style={styles.reasonText}>{r}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Linked accounts */}
          {linkedAccounts && linkedAccounts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Linked Fraud Accounts ({linkedAccounts.length})
              </Text>
              {linkedAccounts.map((acc, i) => (
                <LinkedAccountCard key={i} account={acc} />
              ))}
            </View>
          )}

          {/* Action button */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: actionColor }]}
            onPress={handleAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Scan another */}
        <TouchableOpacity style={styles.backBtn} onPress={onScanAnother}>
          <Text style={styles.backBtnText}>← Scan Another</Text>
        </TouchableOpacity>

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
  screenTitle: {
    fontSize:      28,
    fontWeight:   '900',
    color:         COLORS.accent,
    textAlign:    'center',
    letterSpacing: 4,
  },
  screenSubtitle: {
    color:        COLORS.textSecondary,
    textAlign:   'center',
    fontSize:     12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom:  24,
  },
  card: {
    borderRadius:  16,
    padding:       20,
    borderWidth:    1,
    marginBottom:  16,
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius:  10,
    elevation:      8,
  },
  grayCard: {
    backgroundColor: COLORS.grayBg,
    borderColor:     COLORS.gray,
    alignItems:      'center',
    padding:          30,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:   4,
  },
  resultIcon: {
    fontSize: 36,
  },
  resultLevel: {
    fontSize:      13,
    fontWeight:   '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  resultName: {
    color:      COLORS.textPrimary,
    fontSize:   18,
    fontWeight: '700',
    marginTop:   2,
  },
  resultUpi: {
    color:    COLORS.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    height:          1,
    backgroundColor: COLORS.cardBorder,
    marginVertical:  16,
  },
  warningText: {
    fontSize:   14,
    lineHeight:  22,
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color:        COLORS.textSecondary,
    fontSize:     11,
    fontWeight:   '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom:  8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    marginBottom:   6,
  },
  bullet: {
    fontSize:    14,
    marginRight:  6,
    marginTop:    1,
  },
  reasonText: {
    color:    COLORS.textPrimary,
    fontSize: 13,
    flex:     1,
    lineHeight: 20,
  },
  actionBtn: {
    borderRadius: 12,
    padding:      16,
    alignItems:  'center',
    marginTop:    20,
  },
  actionBtnText: {
    color:      COLORS.white,
    fontSize:   16,
    fontWeight: '800',
  },
  offlineIcon: {
    fontSize:     40,
    marginBottom: 12,
  },
  offlineTitle: {
    color:        COLORS.white,
    fontSize:     22,
    fontWeight:  '800',
    marginBottom:  8,
  },
  offlineMsg: {
    color:     COLORS.textSecondary,
    fontSize:  14,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorDetail: {
    color:      COLORS.red,
    fontSize:   11,
    marginTop:  12,
    textAlign: 'center',
  },
  backBtn: {
    alignItems:    'center',
    padding:        16,
    marginBottom:   20,
  },
  backBtnText: {
    color:      COLORS.accent,
    fontSize:   15,
    fontWeight: '600',
  },
});
