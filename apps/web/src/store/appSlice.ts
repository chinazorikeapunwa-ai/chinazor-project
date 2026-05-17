import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isOnline: boolean;
  isSyncing: boolean;
  syncMessage: string | null;
  syncProgress: number;
}

const initialState: AppState = {
  isOnline: navigator.onLine,
  isSyncing: false,
  syncMessage: null,
  syncProgress: 0,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
    setSyncMessage(state, action: PayloadAction<string | null>) {
      state.syncMessage = action.payload;
    },
    setSyncProgress(state, action: PayloadAction<number>) {
      state.syncProgress = action.payload;
    },
  },
});

export const { setOnlineStatus, setSyncing, setSyncMessage, setSyncProgress } = appSlice.actions;
export default appSlice.reducer;
