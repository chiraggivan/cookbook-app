import React, { createContext, useState } from "react";

export const MyIngredientContext = createContext();

export const MyIngredientProvider = ({ children }) => {
  const [myIngredients, setMyIngredients] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  return (
    <MyIngredientContext.Provider
      value={{ myIngredients, setMyIngredients, fetchedOnce, setFetchedOnce }}
    >
      {children}
    </MyIngredientContext.Provider>
  );
};
