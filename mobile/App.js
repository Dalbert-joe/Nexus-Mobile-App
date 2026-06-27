// ⬡ NEXUS — UPI Fraud Detection App
// 🔁 Before running: open mobile/config.js and replace YOUR-REPLIT-URL with your actual Replit URL

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from './constants/theme';
import HomeScreen   from './screens/HomeScreen';
import ResultScreen from './screens/ResultScreen';

export default function App() {
  const [screen, setScreen] = useState('home');  // 'home' | 'result'
  const [scanData, setScanData] = useState(null);

  function handleResult({ data, upiId, error }) {
    setScanData({ data, upiId, error });
    setScreen('result');
  }

  function handleScanAnother() {
    setScanData(null);
    setScreen('home');
  }

  return (
    <View style={styles.root}>
      {screen === 'home' && (
        <HomeScreen onResult={handleResult} />
      )}
      {screen === 'result' && (
        <ResultScreen
          result={scanData?.data}
          upiId={scanData?.upiId}
          error={scanData?.error}
          onScanAnother={handleScanAnother}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
});
