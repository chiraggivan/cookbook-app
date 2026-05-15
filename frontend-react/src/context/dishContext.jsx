import React, { createContext, useState } from "react";

export const DishContext = createContext();

export const DishProvider = ({ children }) => {
  const [dishes, setDishes] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);
  const [dishDetails, setDishDetails] = useState([]);

  return (
    <DishContext.Provider
      value={{ dishes, setDishes, fetchedOnce, setFetchedOnce, dishDetails, setDishDetails }}
    >
      {children}
    </DishContext.Provider>
  );
};
