import { createContext, useContext } from "react";

export const EmployeeLayoutContext = createContext(null);

export function useEmployeeLayout() {
  const value = useContext(EmployeeLayoutContext);
  if (!value) {
    throw new Error("useEmployeeLayout must be used within <EmployeeLayout />");
  }
  return value;
}

