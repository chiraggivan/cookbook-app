import React, { createContext, useState } from "react";

export const UserIngContext = createContext();

export const UserIngProvider = ({ children }) => {
  const [userIng, setUserIng] = useState([]);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  return (
    <UserIngContext.Provider value={{ userIng, setUserIng, fetchedOnce, setFetchedOnce }}>
      {children}
    </UserIngContext.Provider>
  );
};
