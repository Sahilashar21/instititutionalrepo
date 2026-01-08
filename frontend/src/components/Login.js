// // import { useState, useContext } from "react";
// // import {
// //   Button,
// //   TextField,
// //   Container,
// //   Typography,
// //   Box,
// //   Paper,
// // } from "@mui/material";
// // import axios from "axios";
// // import { AuthContext } from "../context/AuthContext";
// // import { useNavigate } from "react-router-dom";

// // const Login = () => {
// //   const { login } = useContext(AuthContext);
// //   const navigate = useNavigate();

// //   const [form, setForm] = useState({ email: "", password: "" });
// //   const [error, setError] = useState("");

// //   const handleChange = (e) =>
// //     setForm({ ...form, [e.target.name]: e.target.value });

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError("");
// //     try {
// //       const res = await axios.post("http://localhost:5000/api/auth/login", form);
// //       login(res.data.user, res.data.token);
// //       const role = res.data.user.role;
// //       navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
// //     } catch (err) {
// //       setError(err.response?.data?.message || "Login failed");
// //     }
// //   };

// //   return (
// //     <Container maxWidth="sm">
// //       <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
// //         <Typography variant="h5" gutterBottom>
// //           Institutional Repository Login
// //         </Typography>
// //         <form onSubmit={handleSubmit}>
// //           <TextField
// //             label="Email"
// //             name="email"
// //             value={form.email}
// //             onChange={handleChange}
// //             fullWidth
// //             margin="normal"
// //             required
// //           />
// //           <TextField
// //             label="Password"
// //             name="password"
// //             value={form.password}
// //             onChange={handleChange}
// //             type="password"
// //             fullWidth
// //             margin="normal"
// //             required
// //           />
// //           {error && (
// //             <Typography color="error" variant="body2">
// //               {error}
// //             </Typography>
// //           )}
// //           <Box mt={2}>
// //             <Button type="submit" variant="contained" fullWidth>
// //               Login
// //             </Button>
// //           </Box>
// //         </form>
// //       </Paper>
// //     </Container>
// //   );
// // };

// // export default Login;



// import { useState, useContext } from "react";
// import {
//   Button,
//   TextField,
//   Container,
//   Typography,
//   Box,
//   Paper,
// } from "@mui/material";
// import axios from "axios";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//       const API = process.env.REACT_APP_API_URL;

//     try {
//       const res = await axios.post(`${API}/api/auth/login`, form);

//       login(res.data.user, res.data.token);

//       const role = res.data.user.role;

//       // role-based navigation
//       if (role === "admin") {
//         navigate("/admin/dashboard");
//       } else if (role === "clerk") {
//         navigate("/clerk/dashboard");
//       } else if (role === "user") {
//         navigate("/user/dashboard");
//       } else {
//         setError("Unknown role, contact administrator");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <Container maxWidth="sm">
//       <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
//         <Typography variant="h5" gutterBottom>
//           Institutional Repository Login
//         </Typography>
//         <form onSubmit={handleSubmit}>
//           <TextField
//             label="User ID"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//             required
//           />
//           <TextField
//             label="Password"
//             name="password"
//             value={form.password}
//             onChange={handleChange}
//             type="password"
//             fullWidth
//             margin="normal"
//             required
//           />
//           {error && (
//             <Typography color="error" variant="body2">
//               {error}
//             </Typography>
//           )}
//           <Box mt={2}>
//             <Button type="submit" variant="contained" fullWidth>
//               Login
//             </Button>
//           </Box>
//         </form>
//       </Paper>
//     </Container>
//   );
// };

// export default Login;



import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const API = process.env.REACT_APP_API_URL;

    try {
      const res = await axios.post(`${API}/api/auth/login`, form);

      login(res.data.user, res.data.token);

      const role = res.data.user.role;

      // role-based navigation
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "clerk") {
        navigate("/clerk/dashboard");
      } else if (role === "user") {
        navigate("/user/dashboard");
      } else {
        setError("Unknown role, contact administrator");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <h1 className="login-title">Institutional Repository Login</h1>
          <p className="login-subtitle">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              User ID
            </label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your user ID"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg
                className="error-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* <div className="login-footer">
          <a href="#" className="footer-link">
            Forgot password?
          </a>
          <span className="footer-separator">•</span>
          <a href="#" className="footer-link">
            Need help?
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
