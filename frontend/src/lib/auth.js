export const checkAuth = () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token) {
    return { isAuthenticated: false };
  }

  // Check if token is expired (basic check)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.clear();
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true, userType };
  } catch {
    return { isAuthenticated: false };
  }
};

export const logout = () => {
  localStorage.clear();
  window.location.href = '/login';
};