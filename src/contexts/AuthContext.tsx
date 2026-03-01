import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    emailOrUsername: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    username: string,
    email: string,
    password: string,
    leetcodeUsername: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


/**
 * Map backend API user response to frontend User type
 */
const mapApiUserToUser = (userData: unknown): User => {
  const data = userData as {
    id: string;
    username?: string;
    name?: string;
    email: string;
    leetcodeUsername?: string;
    avatar?: string;
    createdAt?: string;
  };
  const username = data.username || data.name || "user";
  return {
    id: data.id,
    name: data.name || username,
    username,
    email: data.email,
    leetcodeUsername: data.leetcodeUsername || "",
    avatar:
      data.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    createdAt: data.createdAt,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {

        setUser(JSON.parse(savedUser));
      } catch {

        const response = await authApi.getProfile();
        if (response.success && response.data) {
          const mappedUser = mapApiUserToUser(response.data);
          localStorage.setItem("user", JSON.stringify(mappedUser));
          setUser(mappedUser);
        } else {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error: unknown) {
        console.error("Profile fetch unsuccessful during session restore:", error);
        localStorage.removeItem("auth_token");

        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  // MOCK LOGIN
  const login = async (emailOrUsername: string, password: string) => {
    setIsLoading(true);

    try {
      const mockUser: User = {
        id: "1",
        name: emailOrUsername,
        username: emailOrUsername,
        email: emailOrUsername.includes("@")
          ? emailOrUsername
          : `${emailOrUsername}@demo.com`,
        leetcodeUsername: emailOrUsername,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailOrUsername}`,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("auth_token", "mock_token_123");
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);

      return { success: true };

    } catch {
      return { success: false, message: "Login failed" };

    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      if (err.message === "Network Error") {
        console.warn("Backend not found. Using mock login for UI preview.");
        const mockUser: User = {
          id: "mock-id",
          name: emailOrUsername.split("@")[0] || emailOrUsername,
          email: emailOrUsername.includes("@")
            ? emailOrUsername
            : `${emailOrUsername}@example.com`,
          leetcodeUsername: emailOrUsername.split("@")[0] || emailOrUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailOrUsername}`,
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      }
      return {
        success: false,
        message:
          err.response?.data?.message || err.message || "Login failed",
      };

    } finally {
      setIsLoading(false);
    }
  };

  // MOCK REGISTER
  const register = async (
    username: string,
    email: string,
    password: string,
    leetcodeUsername: string
  ) => {
    setIsLoading(true);

    try {
      const mockUser: User = {
        id: "1",
        name: username,
        username,

        email,
        leetcodeUsername,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        createdAt: new Date().toISOString(),
      };

        password,
        leetcodeUsername
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message || "Registration failed",
        };
      }

      const { user: userData, token } = response.data;
      const mappedUser = mapApiUserToUser(userData);

      localStorage.setItem("auth_token", "mock_token_123");
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);

      return { success: true };

    } catch {
      return { success: false, message: "Registration failed" };

    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      if (err.message === "Network Error") {
        console.warn("Backend not found. Using mock registration for UI preview.");
        const mockUser: User = {
          id: "mock-id",
          name: username,
          email: email,
          leetcodeUsername: leetcodeUsername,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        };
        localStorage.setItem("auth_token", "mock-token");
        localStorage.setItem("user", JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      }
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Registration failed",
      };

    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};