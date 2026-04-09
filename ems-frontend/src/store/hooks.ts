import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// ─────────────────────────────────────────────
// TYPED HOOKS
// Use these instead of plain useDispatch / useSelector
// everywhere in the app — gives full TypeScript inference
// ─────────────────────────────────────────────

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
