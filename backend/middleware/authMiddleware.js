// const jwt = require("jsonwebtoken");

// function authMiddleware(req, res, next) {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "No token, authorization denied" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // { id, role }
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// }

// module.exports = authMiddleware;




const jwt = require("jsonwebtoken");
const XLSX = require("xlsx");
const path = require("path");

// Read excel utility
const readExcel = (fileName) => {
  const filePath = path.join(__dirname, "../data", fileName);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admins = readExcel("admin.xls");
    const clerks = readExcel("clerk.xls");
    const students = readExcel("students.xls");

    let user = null;
    let role = null;
    let id = null;

    // ---- ADMIN ----
    user = admins.find(
      (a) => a.Email === email && String(a.Password) === String(password)
    );
    if (user) {
      role = "admin";
      id = user.AdminID || user.ID || user.Email;
    }

    // ---- CLERK ----
    if (!user) {
      user = clerks.find(
        (c) => c.Email === email && String(c.Password) === String(password)
      );
      if (user) {
        role = "clerk";
        id = user.ClerkID || user.ID || user.Email;
      }
    }

    // ---- STUDENT ----
    if (!user) {
      user = students.find(
        (s) => s.Email === email && String(s.Password) === String(password)
      );
      if (user) {
        role = "user";
        id = user.UID || user.RollNo || user.Email;
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ---- JWT ----
    const token = jwt.sign(
      {
        id,          // 👈 SAME KEY AS BEFORE
        role,
        email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id,          // 👈 frontend still gets id
        name: user.Name || "User",
        role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
