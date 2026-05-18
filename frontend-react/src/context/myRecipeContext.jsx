import React, { createContext, useState } from "react";

export const MyRecipeContext = createContext();

export const MyRecipeProvider = ({ children }) => {
  const [myRecipes, setMyRecipes] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState([]);

  return (
    <MyRecipeContext.Provider
      value={{
        myRecipes,
        setMyRecipes,
        fetchedOnce,
        setFetchedOnce,
        recipeDetails,
        setRecipeDetails,
      }}
    >
      {children}
    </MyRecipeContext.Provider>
  );
};
