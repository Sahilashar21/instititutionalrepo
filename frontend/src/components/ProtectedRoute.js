// // src/components/ProtectedRoute.jsx
// import React from "react";
// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children, role }) {
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!user) {
//     return <Navigate to="/login" />;
//   }

//   // If role is specified and user role doesn't match → redirect
//   if (role && user.role !== role) {
//     return <Navigate to={`/${user.role}/dashboard`} />;
//   }

//   return children;
// }



// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  // Allow multiple roles (string OR array)
  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) {
        return <Navigate to="/" />;
      }
    } else {
      if (user.role !== role) {
        return <Navigate to="/" />;
      }
    }
  }

  return children;
}
