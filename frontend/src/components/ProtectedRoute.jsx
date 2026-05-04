import { Navigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Simplified Auth provider logic for boilerplate.
// In a larger app, use React Context.
export const getAuthToken = () => localStorage.getItem("access_token");

export const getAuthUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // basic expiration check
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("access_token");
      return null;
    }
    return {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email
    };
  } catch (err) {
    return null;
  }
};

const ProtectedRoute = ({ allowedRoles }) => {
  const user = getAuthUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for this specific route but logged in, bounce to their main dashboard
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
