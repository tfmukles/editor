import { RootState } from "@/redux/store";
import { IConfig } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: IConfig = {
  userName: "",
  repo: "",
  token: "",
  installation_token: "",
  provider: "Github",
  branch: "",
  isRawMode: false,
  content: {
    root: "",
  },
  environment: "nextjs",
  media: {
    public: "",
    root: "",
  },
  arrangement: [],
  themeConfig: [],
  showCommitModal: false,
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    updateConfig: (state, action: PayloadAction<Partial<IConfig>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    resetConfig: () => {
      return {
        ...initialState,
      };
    },
    setRawMode: (state, action: PayloadAction<boolean>) => {
      state.isRawMode = action.payload;
    },
  },
});

export const { updateConfig, setRawMode, resetConfig } = configSlice.actions;
export const selectConfig = (state: RootState) => state.config;

export default configSlice.reducer;
