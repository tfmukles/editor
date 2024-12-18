import { useState } from "react";

type Init<T> = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string;
  data: null | T;
};

type Config<T, I> = {
  onSuccess?: ({ response, meta }: { response: T; meta: I }) => void;
  onError?: (error: string) => void;
  skip?: boolean;
};

const defaultConfig = {
  onSuccess: () => {},
  onError: () => {},
};

export const usePost = <I, T>(
  callback: (data: I) => Promise<T>,
  config: Config<T, I> = defaultConfig,
) => {
  const { onSuccess, onError, skip } = config;
  const [state, setState] = useState<Init<T>>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: "",
    data: null,
  });

  const post = async (formData: I) => {
    if (skip) return; // Skip if configured to do so

    setState((state) => ({
      ...state,
      isLoading: true,
      isSuccess: false,
      error: "",
      data: null,
      isError: false,
    }));

    try {
      const data = await callback(formData);
      setState((state) => ({
        ...state,
        isError: false,
        error: "",
        isLoading: false,
        isSuccess: true,
        data,
      }));

      if (onSuccess) {
        onSuccess({ response: data, meta: formData });
      }

      return data;
    } catch (err: any) {
      setState((state) => ({
        ...state,
        isLoading: false,
        isSuccess: false,
        data: null,
        isError: true,
        error: err.message || "Something went wrong", // Use error message if available
      }));

      if (onError) {
        onError(err.message || "Something went wrong");
      }
    }
  };

  return [post, { ...state, onSuccess, onError }] as const;
};
