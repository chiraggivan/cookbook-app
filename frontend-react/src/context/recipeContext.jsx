import React, { createContext, useState } from "react";

export const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  return (
    <RecipeProvider.Provider value={{ recipes, setRecipes, fetchedOnce, setFetchedOnce }}>
      {children}
    </RecipeProvider.Provider>
  );
};
