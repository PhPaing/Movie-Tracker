import { createContext, useContext, useState } from 'react';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem('auth') || 'null'));
  const save = (a) => {
    setAuth(a);
    a ? localStorage.setItem('auth', JSON.stringify(a)) : localStorage.removeItem('auth');
  };
  return <Ctx.Provider value={{ auth, login: save, logout: () => save(null) }}>{children}</Ctx.Provider>;
}
