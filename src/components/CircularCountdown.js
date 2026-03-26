import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { formatMMSS } from '../utils/date';

export default function CircularCountdown({
  remainingSeconds,
  progress,
  size = 240,
  strokeWidth = 12,
  ringColor = '#2563EB',
  trackColor = 'rgba(37, 99, 235, 0.15)',
  centerLabel,
}) {
  const safeProgress = Math.max(0, Math.min(1, progress ?? 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safeProgress);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={styles.time}>{formatMMSS(remainingSeconds)}</Text>
        {centerLabel ? <Text style={styles.subLabel}>{centerLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 44,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  subLabel: {
    marginTop: 4,
    fontSize: 14,
    color: '#475569',
  },
});

