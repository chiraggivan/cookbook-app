import React, { createContext, useState } from "react";

export const FoodPlanContext = createContext();

export const FoodPlanProvider = ({ children }) => {
  const [dishes, setDishes] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  return (
    <FoodPlanContext.Provider value={{ dishes, setDishes, fetchedOnce, setFetchedOnce }}>
      {children}
    </FoodPlanContext.Provider>
  );
};
