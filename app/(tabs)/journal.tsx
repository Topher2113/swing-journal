import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { usePartnerLink } from '@/hooks/usePartnerLink';
import { usePartnerJournal } from '@/hooks/usePartnerJournal';
import { useAuth } from '@/context/AuthContext';
import { InviteCodeCard } from '@/components/InviteCodeCard';
import { PartnerJournalHeader } from '@/components/PartnerJournalHeader';
import { SharedMoveCard } from '@/components/SharedMoveCard';
import { SortDropdown } from '@/components/SortDropdown';
import { EmptyState } from '@/components/EmptyState';
import { PartnerLink } from '@/types/Auth';
import { useSortedSharedMoves, JOURNAL_SORT_OPTIONS } from '@/hooks/useSortedSharedMoves';
import { C } from '@/constants/theme';


export default function JournalScreen() {
  const { link, loading, generateInviteCode, redeemInviteCode, cancelInviteCode } = usePartnerLink();

  if (loading) return null;

  if (!link || link.status !== 'linked') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Journal' }} />
        <InviteCodeCard
          link={link}
          onGenerate={generateInviteCode}
          onRedeem={redeemInviteCode}
          onCancel={cancelInviteCode}
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
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useSortedSharedMoves(items, sortKey, sortDir);

  const isUserA = user?.email === link.userEmailA;
  const partnerEmail = isUserA ? (link.userEmailB ?? 'Partner') : link.userEmailA;
  const partnerName = isUserA ? link.userNameB : link.userNameA;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Journal', headerShown: true }} />
      <PartnerJournalHeader
        partnerEmail={partnerEmail}
        partnerName={partnerName}
        syncing={syncing}
        onSync={sync}
      />
      <View style={styles.sortRow}>
        <SortDropdown
          sortKey={sortKey}
          sortDir={sortDir}
          options={JOURNAL_SORT_OPTIONS}
          onSort={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        />
      </View>
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
  sortRow: {
    paddingTop: 12,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
});
