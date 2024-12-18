import {
  CSSObjectWithLabel,
  ControlProps,
  GroupBase,
  OptionProps,
} from "react-select";

export const DEFAULT_ERROR = "SOMETHING_WENT_WRONG";
export const SCHEMA_FOLDER = ".sitepins/schema";
export const Token = process.env.NEXT_PUBLIC_TOKEN;
export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY!;
export const POSTHOG_API = process.env.NEXT_PUBLIC_POSTHOG_KEY!;
export const GITHUB_APP_NAME = process.env.NEXT_PUBLIC_GITHUB_APP_NAME!;
export const AcceptImages = {
  "image/png": [],
  "image/jpg": [],
  "image/jpeg": [],
  "image/webp": [],
  "image/svg+xml": [".svg"],
};

export const MAX_SIZE = 1000000 * 10; // 10MB
export const MAX_FILES = 10;

export const style = {
  control: (
    provided: CSSObjectWithLabel,
    state: ControlProps<
      {
        label: any;
        value: any;
      },
      false,
      GroupBase<{
        label: any;
        value: any;
      }>
    >,
  ) => {
    return {
      ...provided,
      borderColor: state.isFocused ? "var(--border)" : "none",
      boxShadow: "none",
      "&:hover": {
        borderColor: "var(--border)",
      },
    };
  },
  option: (
    provided: CSSObjectWithLabel,
    state: OptionProps<unknown, false, GroupBase<unknown>>,
  ) => {
    return {
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--light-color)"
        : state.isFocused
          ? "hsl(var(--accent))"
          : "",
      color: state.isSelected
        ? "hsl(var(--accent-foreground))"
        : "hsl(var(--foreground))",
    };
  },
};
