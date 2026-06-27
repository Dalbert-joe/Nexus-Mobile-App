import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function RiskBadge({ score }) {
  const color =
    score < 30  ? COLORS.green  :
    score <= 70 ? COLORS.orange :
                  COLORS.red;

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.score, { color }]}>{score}</Text>
      <Text style={styles.label}>/ 100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection:  'row',
    alignItems:     'baseline',
    borderWidth:    1,
    borderRadius:   8,
    paddingHorizontal: 10,
    paddingVertical:    4,
  },
  score: {
    fontSize:   22,
    fontWeight: '800',
  },
  label: {
    fontSize:   12,
    color:      COLORS.textSecondary,
    marginLeft:  4,
  },
});
