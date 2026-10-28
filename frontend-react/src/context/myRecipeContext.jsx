import React, { createContext, useState } from "react";

export const MyRecipeContext = createContext();

export const MyRecipeProvider = ({ children }) => {
  const [myRecipesCntxt, setMyRecipesCntxt] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState([]);
  const [hasMoreMyRecipesCntxt, setHasMoreMyRecipesCntxt] = useState(false);
  const [pageNoMyRecipesCntxt, setPageNoMyRecipesCntxt] = useState(1);

  return (
    <MyRecipeContext.Provider
      value={{
        myRecipesCntxt,
        setMyRecipesCntxt,
        fetchedOnce,
        setFetchedOnce,
        recipeDetails,
        setRecipeDetails,
        hasMoreMyRecipesCntxt,
        setHasMoreMyRecipesCntxt,
        pageNoMyRecipesCntxt,
        setPageNoMyRecipesCntxt,
      }}
    >
      {children}
    </MyRecipeContext.Provider>
  );
};
