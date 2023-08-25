import { useLayoutEffect as useBaseLayoutEffect, useEffect } from 'react';

export const useLayoutEffect: typeof useBaseLayoutEffect = (effect, deps?) => {
  if (typeof window !== 'undefined') {
    return useBaseLayoutEffect(effect, deps);
  }
  return useEffect(effect, deps);
};
