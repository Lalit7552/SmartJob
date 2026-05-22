import { createContext, useContext } from "react";

export const WorkerLayoutContext = createContext(null);

export function useWorkerLayout() {
  const value = useContext(WorkerLayoutContext);
  if (!value) {
    throw new Error("useWorkerLayout must be used within <WorkerLayout />");
  }
  return value;
}

