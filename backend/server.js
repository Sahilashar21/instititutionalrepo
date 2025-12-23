// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const auth = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const authRoutes = require("./routes/auth"); // 🔐 Auth routes (login, etc.)

const app = express();
const PORT = process.env.PORT || 5000;

// 🌐 Middleware
app.use(cors());
app.use(express.json());

mongodb://localhost:27017/institutional_repo

// 🧠 MongoDB Connection
// mongoose.connect("mongodb+srv://sahilashar21:LOBqKPV3GcmxNEsJ@cluster0.qbnh7lv.mongodb.net/library?retryWrites=true&w=majority&appName=Cluster0", 
mongoose.connect("mongodb://localhost:27017/institutional_repo2",{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected ✅"))
.catch((err) => console.error("MongoDB error ❌", err));

// 🧪 Root Test Route
app.get("/", (req, res) => {
  res.send("API is working 🟢");
});

// 🔐 Auth routes
app.use("/api/auth", authRoutes);

// 🧪 Protected test routes
app.get("/api/admin-only", auth, roleMiddleware("admin"), (req, res) => {
  res.send("Welcome Admin!");
});

app.get("/api/user-dashboard", auth, (req, res) => {
  res.send(`Hello ${req.user.role}, you are logged in.`);
});

const adminResourceRoutes = require("./routes/adminResources");
app.use("/api/admin/resources", adminResourceRoutes);

const accessionRoutes = require("./routes/accession");
app.use("/api/accession", accessionRoutes);

const resourceRoutes = require("./routes/resources");
app.use("/api/resources", resourceRoutes);


// app.use("/api/resources", require("./routes/resources"));

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// // backend/server.js
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const auth = require("./middleware/authMiddleware");
// const roleMiddleware = require("./middleware/roleMiddleware");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB (local)
// mongoose.connect("mongodb://localhost:27017/institutional_repo", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log("MongoDB connected ✅"))
// .catch((err) => console.error("MongoDB error ❌", err));

// // Test route
// app.get("/", (req, res) => {
//   res.send("API is working 🟢");
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// const authRoutes = require("./routes/auth");
// app.use("/api/auth", authRoutes);

// // Example test route for admin-only access
// app.get("/api/admin-only", auth, roleMiddleware("admin"), (req, res) => {
//   res.send("Welcome Admin!");
// });

// // Example for any logged-in user
// app.get("/api/user-dashboard", auth, (req, res) => {
//   res.send(`Hello ${req.user.role}, you are logged in.`);
// });