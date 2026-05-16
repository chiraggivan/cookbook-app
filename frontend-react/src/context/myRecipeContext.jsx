import React, { createContext, useState } from "react";

export const MyRecipeContext = createContext();

export const MyRecipeProvider = ({ children }) => {
  const [myRecipes, setMyRecipes] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  return (
    <MyRecipeContext.Provider value={{ myRecipes, setMyRecipes, fetchedOnce, setFetchedOnce }}>
      {children}
    </MyRecipeContext.Provider>
  );
};
