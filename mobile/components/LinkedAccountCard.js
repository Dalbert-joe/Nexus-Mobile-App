import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function LinkedAccountCard({ account }) {
  const threatColor =
    account.threat === 'FRAUDULENT' ? COLORS.red :
    account.threat === 'HIGH_RISK'  ? COLORS.orange :
                                      COLORS.gray;

  const scoreColor =
    account.riskScore < 30  ? COLORS.green  :
    account.riskScore <= 70 ? COLORS.orange :
                               COLORS.red;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{account.name}</Text>
        <Text style={[styles.threat, { color: threatColor }]}>
          {account.threat}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.device}>📱 {account.device}</Text>
        <Text style={[styles.score, { color: scoreColor }]}>
          Risk: {account.riskScore}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A1A',
    borderRadius:    8,
    padding:         10,
    marginTop:       8,
    borderWidth:     1,
    borderColor:     COLORS.cardBorder,
  },
  row: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:    2,
  },
  name: {
    color:      COLORS.textPrimary,
    fontWeight: '600',
    fontSize:   13,
  },
  threat: {
    fontSize:   11,
    fontWeight: '700',
  },
  device: {
    color:    COLORS.textSecondary,
    fontSize: 11,
  },
  score: {
    fontSize:   12,
    fontWeight: '700',
  },
});
