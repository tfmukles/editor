import { context } from "@/lib/context";
import { context as contextType } from "@/lib/context/type";
import { useContext } from "react";

export const useProvider = () => {
  // @ts-ignore
  const store = useContext(context);

  if (!store) {
    throw new Error("useProvider must be used within a StoreProvider");
  }

  // @ts-ignore
  return store as contextType;
};
