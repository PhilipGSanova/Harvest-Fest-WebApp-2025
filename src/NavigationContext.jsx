import { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [allowedRoutes, setAllowedRoutes] = useState([]);

  const allowRoute = (routeName) => {
    setAllowedRoutes((prev) => [...new Set([...prev, routeName])]);
  };

  return (
    <NavigationContext.Provider value={{ allowedRoutes, allowRoute }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
