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
});
