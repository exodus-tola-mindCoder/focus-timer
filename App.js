import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import CircularCountdown from './src/components/CircularCountdown';
import { addDaysLocal, formatShortDate, getLocalISODate, parseLocalISODate } from './src/utils/date';
import { getFocusTimerSummary, recordFocusCompletion } from './src/storage/focusTimerStorage';
import MpesaPaymentScreen from './src/screens/MpesaPaymentScreen';

const DEFAULT_MINUTES = 25;
const TOTAL_SECONDS = DEFAULT_MINUTES * 60;

function PrimaryButton({ title, onPress, variant = 'primary', disabled }) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      <Text style={[styles.buttonText, isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function StatPill({ label, value }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState('timer'); // 'timer' | 'stats' | 'payment'

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_SECONDS);

  const endTimeMsRef = useRef(null);
  const completionRecordedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getFocusTimerSummary();
        if (mounted) setSummary(s);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load timer summary', e);
      } finally {
        if (mounted) setSummaryLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const progress = useMemo(() => {
    const doneSeconds = TOTAL_SECONDS - remainingSeconds;
    return TOTAL_SECONDS > 0 ? doneSeconds / TOTAL_SECONDS : 0;
  }, [remainingSeconds]);

  const centerLabel = useMemo(() => {
    if (isCompleting) return 'Finishing...';
    if (remainingSeconds <= 0 && !isRunning) return 'Session complete';
    if (isRunning) return 'Focus session';
    return 'Ready';
  }, [isCompleting, isRunning, remainingSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      if (endTimeMsRef.current == null) return;
      const msLeft = endTimeMsRef.current - Date.now();
      if (msLeft <= 0) {
        setRemainingSeconds(0);
        setIsRunning(false);

        if (!completionRecordedRef.current) {
          completionRecordedRef.current = true;
          (async () => {
            setIsCompleting(true);
            try {
              const updated = await recordFocusCompletion(new Date());
              setSummary(updated);
            } catch (e) {
              // eslint-disable-next-line no-console
              console.warn('Failed to record completion', e);
            } finally {
              setIsCompleting(false);
            }
          })();
        }
      } else {
        setRemainingSeconds(Math.max(0, Math.ceil(msLeft / 1000)));
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartPause = () => {
    if (isCompleting) return;

    if (isRunning) {
      if (endTimeMsRef.current != null) {
        const msLeft = endTimeMsRef.current - Date.now();
        setRemainingSeconds(Math.max(0, Math.ceil(msLeft / 1000)));
      }
      endTimeMsRef.current = null;
      completionRecordedRef.current = false;
      setIsRunning(false);
      return;
    }

    const secondsToUse = remainingSeconds <= 0 ? TOTAL_SECONDS : remainingSeconds;
    completionRecordedRef.current = false;
    setRemainingSeconds(secondsToUse);
    endTimeMsRef.current = Date.now() + secondsToUse * 1000;
    setIsRunning(true);
  };

  const handleReset = () => {
    if (isCompleting) return;
    endTimeMsRef.current = null;
    completionRecordedRef.current = false;
    setIsRunning(false);
    setRemainingSeconds(TOTAL_SECONDS);
  };

  const todaySessions = summary?.todaySessions ?? 0;
  const totalSessions = summary?.totalSessions ?? 0;
  const streakCount = summary?.streakCount ?? 0;
  const lastCompletionDate = summary?.lastCompletionDate ?? null;

  const last7Days = useMemo(() => {
    const today = parseLocalISODate(getLocalISODate());
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = addDaysLocal(today, -i);
      const dateStr = getLocalISODate(d);
      days.push({
        dateStr,
        label: formatShortDate(d),
        count: Number(summary?.completionsByDate?.[dateStr] || 0),
      });
    }
    return days;
  }, [summary?.completionsByDate]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.brand}>
          {screen === 'timer' ? 'Focus Timer' : screen === 'stats' ? 'Stats' : 'M-Pesa Payment'}
        </Text>
        <View style={styles.headerLinksWrap}>
          {screen !== 'timer' ? (
            <TouchableOpacity onPress={() => setScreen('timer')} style={styles.headerLink}>
              <Text style={styles.headerLinkText}>Timer</Text>
            </TouchableOpacity>
          ) : null}

          {screen !== 'stats' ? (
            <TouchableOpacity onPress={() => setScreen('stats')} style={styles.headerLink}>
              <Text style={styles.headerLinkText}>Stats</Text>
            </TouchableOpacity>
          ) : null}

          {screen !== 'payment' ? (
            <TouchableOpacity onPress={() => setScreen('payment')} style={styles.headerLink}>
              <Text style={styles.headerLinkText}>M-Pesa</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {summaryLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading your streak...</Text>
        </View>
      ) : screen === 'timer' ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.timerWrap}>
            <CircularCountdown
              remainingSeconds={remainingSeconds}
              progress={progress}
              centerLabel={centerLabel}
            />
          </View>

          <View style={styles.controls}>
            <PrimaryButton
              title={isRunning ? 'Pause' : remainingSeconds <= 0 ? 'Start' : 'Start'}
              onPress={handleStartPause}
              disabled={isCompleting}
              variant="primary"
            />
            <PrimaryButton title="Reset" onPress={handleReset} disabled={isCompleting} variant="secondary" />
          </View>

          <View style={styles.statsRow}>
            <StatPill label="Completed today" value={todaySessions} />
            <StatPill label="Total sessions" value={totalSessions} />
          </View>

          <View style={styles.streakBlock}>
            <Text style={styles.streakTitle}>Daily streak</Text>
            <Text style={styles.streakValue}>{streakCount} days</Text>
            <Text style={styles.streakSub}>
              {lastCompletionDate ? `Last completion: ${lastCompletionDate}` : 'Finish a session to start the streak.'}
            </Text>
          </View>

          <View style={styles.weekRow}>
            <Text style={styles.weekTitle}>Last 7 days</Text>
            <View style={styles.weekDots}>
              {last7Days.map((d) => (
                <View key={d.dateStr} style={styles.weekItem}>
                  <View style={[styles.weekDot, d.count > 0 ? styles.weekDotActive : styles.weekDotInactive]} />
                  <Text style={styles.weekLabel}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : screen === 'stats' ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.cards}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Total sessions</Text>
              <Text style={styles.cardValue}>{totalSessions}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Today</Text>
              <Text style={styles.cardValue}>{todaySessions} completed</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Daily streak</Text>
              <Text style={styles.cardValue}>{streakCount} days</Text>
              <Text style={styles.cardSub}>
                {lastCompletionDate ? `Last completion: ${lastCompletionDate}` : 'No sessions yet.'}
              </Text>
            </View>
          </View>

          <View style={styles.weekRow}>
            <Text style={styles.weekTitle}>Activity</Text>
            <View style={styles.weekDots}>
              {last7Days.map((d) => (
                <View key={d.dateStr} style={styles.weekItem}>
                  <View style={[styles.weekDot, d.count > 0 ? styles.weekDotActive : styles.weekDotInactive]} />
                  <Text style={styles.weekLabel}>{d.label}</Text>
                  <Text style={styles.weekCount}>{d.count > 0 ? `${d.count}x` : ''}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <MpesaPaymentScreen />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerLink: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  headerLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  headerLinksWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#475569',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  timerWrap: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    marginTop: 22,
    gap: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2563EB',
  },
  buttonSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  buttonTextPrimary: {
    color: 'white',
  },
  buttonTextSecondary: {
    color: '#0F172A',
  },
  statsRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  pillLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },
  pillValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  streakBlock: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  streakValue: {
    marginTop: 6,
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
  },
  streakSub: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  weekRow: {
    marginTop: 18,
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 12,
  },
  weekDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  weekItem: {
    flex: 1,
    alignItems: 'center',
  },
  weekDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  weekDotActive: {
    backgroundColor: '#2563EB',
  },
  weekDotInactive: {
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
  },
  weekLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textAlign: 'center',
  },
  weekCount: {
    marginTop: 4,
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '800',
    textAlign: 'center',
  },
  cards: {
    marginTop: 12,
    gap: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  cardValue: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardSub: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});
