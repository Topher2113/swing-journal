import { useCallback } from 'react';
import { useLineDances } from './useLineDances';

export function useLineDance(id: string) {
  const { lineDances, updateLineDance, ...rest } = useLineDances();
  const lineDance = lineDances.find((ld) => ld.id === id) ?? null;

  const incrementPractice = useCallback(async () => {
    if (!lineDance) return;
    await updateLineDance({ ...lineDance, practiceCount: lineDance.practiceCount + 1 });
  }, [lineDance, updateLineDance]);

  return { lineDance, incrementPractice, updateLineDance, ...rest };
}
