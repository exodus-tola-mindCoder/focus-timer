import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const FIXED_AMOUNT_ETB = 100;

function generateTransactionId() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = Date.now().toString().slice(-6);
  return `TX-${stamp}-${random}`;
}

export default function MpesaPaymentScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const trimmedPhone = useMemo(() => phoneNumber.trim(), [phoneNumber]);
  const canPay = trimmedPhone.length >= 9 && !isProcessing;

  const handlePayPress = () => {
    if (!canPay) return;

    setIsPaid(false);
    setTransactionId('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setTransactionId(generateTransactionId());
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>M-Pesa Payment (Simulation)</Text>
        <Text style={styles.helperText}>Testing only - no real payment API is used.</Text>

        <Text style={styles.label}>Phone number</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="e.g. 0912345678"
          placeholderTextColor="#94A3B8"
          editable={!isProcessing}
        />

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>{FIXED_AMOUNT_ETB} ETB</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePayPress}
          disabled={!canPay}
          style={[styles.payButton, !canPay ? styles.payButtonDisabled : null]}
        >
          {isProcessing ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>Pay with M-Pesa</Text>
          )}
        </TouchableOpacity>

        {isPaid ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Payment Successful</Text>
            <Text style={styles.successSub}>Transaction ID: {transactionId}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  label: {
    marginTop: 18,
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  amountRow: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  amountValue: {
    fontSize: 18,
    color: '#1D4ED8',
    fontWeight: '900',
  },
  payButton: {
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  payButtonDisabled: {
    opacity: 0.55,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  successBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  successTitle: {
    fontSize: 15,
    color: '#166534',
    fontWeight: '900',
  },
  successSub: {
    marginTop: 6,
    fontSize: 13,
    color: '#15803D',
    fontWeight: '700',
  },
});

