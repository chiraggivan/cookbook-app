import React, { createContext, useState } from "react";

export const MyRecipeContext = createContext();

export const MyRecipeProvider = ({ children }) => {
  const [myRecipes, setMyRecipes] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState([]);
  const [hasMoreMyRecipes, setHasMoreMyRecipes] = useState(false);
  const [pageNoMyRecipes, setPageNoMyRecipes] = useState(1);

  return (
    <MyRecipeContext.Provider
      value={{
        myRecipes,
        setMyRecipes,
        fetchedOnce,
        setFetchedOnce,
        recipeDetails,
        setRecipeDetails,
        hasMoreMyRecipes,
        setHasMoreMyRecipes,
        pageNoMyRecipes,
        setPageNoMyRecipes,
      }}
    >
      {children}
    </MyRecipeContext.Provider>
  );
};
