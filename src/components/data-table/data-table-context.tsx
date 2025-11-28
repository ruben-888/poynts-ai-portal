import React, { createContext, useContext, useState } from "react";

interface DataTableContextType<T> {
  isActionModalOpen: boolean;
  setIsActionModalOpen: (open: boolean) => void;
  selectedRow: T | null;
  setSelectedRow: (row: T | null) => void;
}

const DataTableContext = createContext<DataTableContextType<any> | undefined>(
  undefined,
);

export function DataTableProvider<T>({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  return (
    <DataTableContext.Provider
      value={{
        isActionModalOpen,
        setIsActionModalOpen,
        selectedRow,
        setSelectedRow,
      }}
    >
      {children}
    </DataTableContext.Provider>
  );
}

export function useDataTable<T>() {
  const context = useContext(DataTableContext);
  if (context === undefined) {
    throw new Error("useDataTable must be used within a DataTableProvider");
  }
  return context as DataTableContextType<T>;
}
