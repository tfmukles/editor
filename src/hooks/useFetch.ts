import { useEffect, useState } from "react";

type init<T> = {
  isLoading: boolean;
  isSuccess: boolean;
  error: string;
  data: null | T;
};

type config<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  skip?: boolean;
};

const defaultConfig = {
  onSuccess: (data: any) => {},
  onError: (error: any) => {},
  skip: false,
};

export const useFetch = <T>(
  callback: () => Promise<T>,
  config: config<T> = defaultConfig,
  deps: any[] = [],
) => {
  const { onSuccess, onError, skip } = config;
  const [state, setState] = useState<init<T>>({
    isLoading: false,
    isSuccess: false,
    error: "",
    data: null,
  });

  const fetching = async () => {
    if (!skip) {
      await setState((s) => ({
        ...s,
        isLoading: true,
        isSuccess: false,
        error: "",
        data: null,
      }));

      try {
        const data = await callback();
        setState((s) => ({
          ...s,
          isLoading: false,
          isSuccess: true,
          data,
          error: "",
        }));
        onSuccess && onSuccess(data);
      } catch (error: any) {
        setState({
          isLoading: false,
          isSuccess: false,
          data: null,
          error: error.message || error || "Something went wrong",
        });
        onError && onError(error.message || error || "Something went wrong");
      }
    }
  };

  useEffect(() => {
    fetching();
  }, [skip, ...deps]);

  return { ...state, refetch: fetching };
};
