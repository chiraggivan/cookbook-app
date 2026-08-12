import { createContext, useContext, useState } from "react";

const GlobalSearchContext = createContext();

export const GlobalSearchProvider = ({ children }) => {
  const [searchRecipe, setSearchRecipe] = useState("");
  const [searchInput, setSearchInput] = useState("");

  return (
    <GlobalSearchContext.Provider
      value={{
        searchRecipe,
        setSearchRecipe,
        searchInput,
        setSearchInput,
      }}
    >
      {children}
    </GlobalSearchContext.Provider>
  );
};

export const useSearch = () => {
  return useContext(GlobalSearchContext);
};
