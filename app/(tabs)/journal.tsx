import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useAuth } from '@/context/AuthContext';
import { InviteCodeCard } from '@/components/InviteCodeCard';
import { PartnerJournalHeader } from '@/components/PartnerJournalHeader';
import { SharedMoveCard } from '@/components/SharedMoveCard';
import { EmptyState } from '@/components/EmptyState';
import { PartnerLink } from '@/types/Auth';
import { C } from '@/constants/theme';

export default function JournalScreen() {
  const { link, loading, generateInviteCode, redeemInviteCode } = usePartnerLink();

  if (loading) return null;

  if (!link || link.status !== 'linked') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Journal' }} />
        <InviteCodeCard
          link={link}
          onGenerate={generateInviteCode}
          onRedeem={redeemInviteCode}
        />
      </View>
    );
  }

  return <JournalLinked link={link} />;
}

function JournalLinked({ link }: { link: PartnerLink }) {
  const router = useRouter();
  const { user } = useAuth();
  const { items, syncing, sync } = usePartnerJournal(link.id);

  const sorted = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const partnerEmail =
    user?.email === link.userEmailA
      ? (link.userEmailB ?? 'Partner')
      : link.userEmailA;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Journal', headerShown: true }} />
      <PartnerJournalHeader
        partnerEmail={partnerEmail}
        syncing={syncing}
        onSync={sync}
      />
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SharedMoveCard
            move={item}
            isOwn={item.addedByUserId === user?.id}
            onPress={() =>
              router.push({ pathname: '/shared-move/[id]' as never, params: { id: item.id, partnerLinkId: link.id } })
            }
          />
        )}
        refreshControl={<RefreshControl refreshing={syncing} onRefresh={sync} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState message="No shared moves yet — tap a move in the Library and share it to get started." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
});
