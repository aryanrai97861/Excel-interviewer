// Disabled authentication - returns static demo user
export function useAuth() {
  return {
    user: { firstName: "Demo", lastName: "User" },
    isLoading: false,
    isAuthenticated: true,
  };
}
