import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartnerLink } from '@/types/Auth';
import { RADIUS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  link: PartnerLink | null;
  onGenerate: () => Promise<void>;
  onRedeem: (code: string) => Promise<void>;
  onCancel: () => Promise<void>;
};

export function InviteCodeCard({ link, onGenerate, onRedeem, onCancel }: Props) {
  const { colors: C } = useTheme();
  const [redeemCode, setRedeemCode] = useState('');
  const [generating, setGenerating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      await onGenerate();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not generate code.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    setError(null);
    setRedeeming(true);
    try {
      await onRedeem(redeemCode);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not redeem code. Check the code and try again.');
    } finally {
      setRedeeming(false);
    }
  };

  const handleShare = () => {
    if (!link) return;
    Share.share({
      message: `Join my Dance Journal! Use code: ${link.inviteCode}`,
      title: 'Dance Journal Partner Invite',
    });
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 40,
    },
    section: {
      alignItems: 'center',
      gap: 12,
    },
    icon: {
      marginBottom: 4,
    },
    heading: {
      fontSize: 22,
      fontWeight: '700',
      color: C.textPrimary,
      textAlign: 'center',
    },
    body: {
      fontSize: 15,
      color: C.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    code: {
      fontSize: 36,
      fontWeight: '700',
      color: C.accent,
      letterSpacing: 3,
      fontFamily: 'monospace',
    },
    button: {
      backgroundColor: C.accent,
      borderRadius: RADIUS.control,
      paddingVertical: 14,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 200,
      marginTop: 4,
    },
    buttonPressed: {
      backgroundColor: C.accentDark,
    },
    buttonText: {
      color: C.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    divider: {
      marginVertical: 24,
      alignItems: 'center',
    },
    dividerText: {
      color: C.textSecondary,
      fontSize: 13,
    },
    redeemRow: {
      flexDirection: 'row',
      gap: 10,
    },
    redeemInput: {
      flex: 1,
      backgroundColor: C.surface,
      borderRadius: RADIUS.control,
      padding: 14,
      fontSize: 16,
      color: C.textPrimary,
      borderWidth: 1,
      borderColor: C.border,
      letterSpacing: 1,
    },
    redeemBtn: {
      backgroundColor: C.accent,
      borderRadius: RADIUS.control,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 70,
    },
    waitingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    waitingText: {
      color: C.textSecondary,
      fontSize: 14,
    },
    error: {
      color: C.error,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
    },
    cancelBtn: {
      marginTop: 'auto',
      marginBottom: 32,
      alignItems: 'center',
      padding: 12,
    },
    cancelBtnPressed: {
      opacity: 0.6,
    },
    cancelText: {
      color: C.error,
      fontSize: 15,
      fontWeight: '500',
    },
  }), [C]);

  if (!link) {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Ionicons name="people-outline" size={40} color={C.textSecondary} style={styles.icon} />
          <Text style={styles.heading}>Link with a Partner</Text>
          <Text style={styles.body}>
            Generate an invite code and share it with your dance partner, or enter a code they've shared with you.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating
              ? <ActivityIndicator color={C.textPrimary} />
              : <Text style={styles.buttonText}>Generate Invite Code</Text>
            }
          </Pressable>
        </View>

        <View style={styles.divider}><Text style={styles.dividerText}>or enter a partner's code</Text></View>

        <View style={styles.redeemRow}>
          <TextInput
            style={styles.redeemInput}
            placeholder="SWING-XXXX"
            placeholderTextColor={C.textSecondary}
            value={redeemCode}
            onChangeText={setRedeemCode}
            autoCapitalize="characters"
          />
          <Pressable
            style={({ pressed }) => [styles.redeemBtn, pressed && styles.buttonPressed]}
            onPress={handleRedeem}
            disabled={redeeming || !redeemCode.trim()}
          >
            {redeeming
              ? <ActivityIndicator color={C.textPrimary} size="small" />
              : <Text style={styles.buttonText}>Join</Text>
            }
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  // Pending: code was generated, waiting for partner
  const handleCancel = () => {
    Alert.alert(
      'Cancel Invite',
      'This will delete the code and stop waiting for your partner. Are you sure?',
      [
        { text: 'Keep Waiting', style: 'cancel' },
        {
          text: 'Cancel Invite',
          style: 'destructive',
          onPress: onCancel,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>Share this code</Text>
        <Text style={styles.code}>{link.inviteCode}</Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={16} color={C.textPrimary} style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Share Code</Text>
        </Pressable>

        <View style={styles.waitingRow}>
          <ActivityIndicator size="small" color={C.textSecondary} />
          <Text style={styles.waitingText}>Waiting for your partner to join…</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}
        onPress={handleCancel}
      >
        <Text style={styles.cancelText}>Cancel Invite</Text>
      </Pressable>
    </View>
  );
}
