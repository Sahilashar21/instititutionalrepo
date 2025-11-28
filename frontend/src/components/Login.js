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
//     try {
//       const res = await axios.post("http://localhost:5000/api/auth/login", form);
//       login(res.data.user, res.data.token);
//       const role = res.data.user.role;
//       navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
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
//             label="Email"
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
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h5" gutterBottom>
          Institutional Repository Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="User ID"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            fullWidth
            margin="normal"
            required
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Box mt={2}>
            <Button type="submit" variant="contained" fullWidth>
              Login
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
