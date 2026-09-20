import React, { createContext, useState } from "react";

export const CurrentUserContext = createContext();

export const CurrentUserProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(0);

  return (
    <CurrentUserContext.Provider
      value={{
        currentUserId,
        setCurrentUserId,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};
