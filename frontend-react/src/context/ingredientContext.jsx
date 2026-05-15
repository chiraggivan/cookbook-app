import React, { createContext, useState } from "react";

export const IngredientContext = createContext();

export const IngredientProvider = ({ children }) => {
  const [ingredients, setIngredients] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  return (
    <IngredientContext.Provider
      value={{ ingredients, setIngredients, fetchedOnce, setFetchedOnce }}
    >
      {children}
    </IngredientContext.Provider>
  );
};
