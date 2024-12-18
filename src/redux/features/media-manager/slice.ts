import { RootState } from "@/redux/store";
import { IFiles } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MediaState {
  media: IFiles[];
  recentUpload: IFiles[];
  sortby: string;
  view: "grid" | "list";
}

const initialState: MediaState = {
  media: [],
  recentUpload: [],
  sortby: "",
  view: "grid",
};

export const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    setMedia: (state, action: PayloadAction<IFiles[]>) => {
      state.media = action.payload;
    },
    setRecentUpload: (state, action: PayloadAction<IFiles[]>) => {
      state.recentUpload = [...state.recentUpload, ...action.payload];
    },

    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortby = action.payload;
      if (state.sortby === "a-z") {
        state.media = state.media.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      }
      if (state.sortby === "z-a") {
        state.media = state.media.sort((a, b) => {
          return b.name.localeCompare(a.name);
        });
      }
    },

    excludeMedia: (state, action: PayloadAction<string>) => {
      state.media = state.media.filter((file) => file.path !== action.payload);
    },

    addNewMedia: (state, action: PayloadAction<IFiles[]>) => {
      state.media = [...action.payload, ...state.media];
    },

    setView: (state, action: PayloadAction<"grid" | "list">) => {
      state.view = action.payload;
    },
  },
});

export const {
  setMedia,
  setRecentUpload,
  excludeMedia,
  addNewMedia,
  setSortBy,
  setView,
} = mediaSlice.actions;
export const selectMediaInfo = (state: RootState) => state.media;

export default mediaSlice;
mediaSlice.reducer;
