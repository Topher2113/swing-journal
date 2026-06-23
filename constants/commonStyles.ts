import { StyleSheet } from 'react-native';
import { C, RADIUS } from './theme';

export const cs = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textPrimary,
    marginTop: 6,
    marginBottom: 2,
  },
  textInput: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.control,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: C.textPrimary,
    minHeight: 50,
  },
  textInputError: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -6,
  },
  multiline: {
    minHeight: 120,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
    gap: 12,
    minHeight: 68,
  },
  videoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: C.textSecondary,
  },
});
