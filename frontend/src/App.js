// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./components/Login";
// import AdminDashboard from "./pages/AdminDashboard";
// import UserDashboard from "./pages/UserDashboard";
// import ClearkDashboard from "./pages/ClearkDashboard"
// import AdminUpload from "./pages/AdminUpload";
// import ResourceViewer from './pages/ResourceViewer';
// import ResourceDetail from "./pages/ResourceDetail";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/admin/dashboard" element={<AdminDashboard />} />
//         <Route path="/user/dashboard" element={<UserDashboard />} />
//         <Route path="/clerk/dashboard" element={<ClearkDashboard/>} />
//         <Route path="/admin/upload" element={<AdminUpload />} />
//         <Route path="/resources/:type" element={<ResourceViewer />} />
//         <Route path="/resources/:type/:id" element={<ResourceDetail />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ClearkDashboard from "./pages/ClearkDashboard";
import AdminUpload from "./pages/AdminUpload";
import ResourceViewer from "./pages/ResourceViewer";
import ResourceDetail from "./pages/ResourceDetail";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUpload />
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Clerk Routes */}
        <Route
          path="/clerk/dashboard"
          element={
            <ProtectedRoute allowedRoles={["clerk"]}>
              <ClearkDashboard />
            </ProtectedRoute>
          }
        />

        {/* Public / Authenticated */}
        <Route
          path="/resources/:type"
          element={
            <ProtectedRoute allowedRoles={["admin", "user", "clerk"]}>
              <ResourceViewer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resources/:type/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "user", "clerk"]}>
              <ResourceDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
