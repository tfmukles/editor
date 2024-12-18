import { createContext } from "react";
import { context as contextType } from "./type";
export const context = createContext<null | contextType>(null);
