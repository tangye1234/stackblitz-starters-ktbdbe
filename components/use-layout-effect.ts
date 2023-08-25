import { useLayoutEffect as useBaseLayoutEffect, useEffect } from 'react';

export const useLayoutEffect =
  typeof window === 'undefined' ? useEffect : useBaseLayoutEffect;
