import { createContext, useContext, useState, useEffect } from 'react';
// import axiosInstance from '../Features/Api/Api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
        //   const userResponse = await axiosInstance.get("/user_auth/me");
          const userData = {username: "admin", role_name: "admin"}; // Mocked user data
          setUser(userData);
        } catch (error) {
          console.error("Auth initialization error:", error);
          sessionStorage.removeItem("token");
        }
      }
      try {
          const userData = {username: "admin", role_name: "admin"}; 
          setUser(userData);
        } catch (error) {
          console.error("Auth initialization error:", error);
          sessionStorage.removeItem("token");
        }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (token) => {
    sessionStorage.setItem("token", token);
    try {
      const userResponse = await axiosInstance.get("/user/me/profile");
      const userData = userResponse; 
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      sessionStorage.removeItem("token");
      return null;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
