// // const User = require("../models/User");
// // const bcrypt = require("bcryptjs");
// // const jwt = require("jsonwebtoken");

// // exports.login = async (req, res) => {
// //   const { email, password } = req.body;
// //   try {
// //     const user = await User.findOne({ email });
// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

// //     const token = jwt.sign(
// //       { id: user._id, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "1d" }
// //     );

// //     res.json({
// //       token,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         role: user.role,
// //       },
// //     });
// //   } catch (err) {
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };


// const jwt = require("jsonwebtoken");
// const XLSX = require("xlsx");
// const path = require("path");

// // --------------------
// // Excel reader
// // --------------------
// const readExcel = (fileName) => {
//   const filePath = path.join(__dirname, "../data", fileName);
//   const workbook = XLSX.readFile(filePath, { cellDates: true });
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   return XLSX.utils.sheet_to_json(sheet, { defval: "" });
// };

// // --------------------
// // DOB → last 2 digits of year (SAFE FOR ALL EXCEL FORMATS)
// // --------------------
// const getYearSuffix = (dob) => {
//   // Case 1: JS Date object
//   if (dob instanceof Date && !isNaN(dob)) {
//     return String(dob.getFullYear()).slice(-2);
//   }

//   // Case 2: Excel serial number
//   if (typeof dob === "number") {
//     const excelEpoch = new Date(1899, 11, 30);
//     const date = new Date(excelEpoch.getTime() + dob * 86400000);
//     return String(date.getFullYear()).slice(-2);
//   }

//   // Case 3: String date
//   const str = String(dob).trim();

//   // Handles DD-MM-YYYY / DD/MM/YYYY / YYYY-MM-DD
//   const match = str.match(/(\d{4})/);
//   if (match) {
//     return match[1].slice(-2);
//   }

//   return null;
// };

// // --------------------
// // LOGIN
// // --------------------
// exports.login = async (req, res) => {
//   const { email, password } = req.body; // ⚠️ FIELDS UNCHANGED

//   if (!email || !password) {
//     return res.status(400).json({ message: "Missing credentials" });
//   }

  
//   try {
//     const students = readExcel("student.xlsx");

//     for (const s of students) {
//       const userId = String(s.UserID || "").trim();
//       const name = String(s.Name || "").trim();
//       const dob = s.DOB;

//       if (!userId || !name || !dob) continue;

//       // First name
//       const firstName = name.split(/\s+/)[0];

//       // Year suffix
//       const year = getYearSuffix(dob);
//       if (!year) continue;

//       const expectedPassword = `${firstName}${year}`;

//       // 🔎 DEBUG (you can remove later)
//       // console.log({ userId, expectedPassword });

//       if (
//         userId === String(email).trim() &&
//         expectedPassword.toLowerCase() === String(password).toLowerCase()
//       ) {
//         const token = jwt.sign(
//           {
//             id: userId,
//             role: "user",
//           },
//           process.env.JWT_SECRET,
//           { expiresIn: "1d" }
//         );

//         return res.json({
//           token,
//           user: {
//             id: userId,
//             name,
//             role: "user",
//           },
//         });
//       }
//     }

//     return res.status(401).json({ message: "Invalid credentials" });
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };




const jwt = require("jsonwebtoken");
const XLSX = require("xlsx");
const path = require("path");

// ==============================
// Excel reader (robust)
// ==============================
const readExcel = (fileName) => {
  const filePath = path.join(__dirname, "../data", fileName);
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: true,
  });
};

// ==============================
// DOB → last 2 digits of year
// (students only)
// ==============================
const getYearSuffix = (dob) => {
  if (!dob) return null;

  // JS Date
  if (dob instanceof Date && !isNaN(dob)) {
    return String(dob.getFullYear()).slice(-2);
  }

  // Excel serial number
  if (typeof dob === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dob * 86400000);
    return String(date.getFullYear()).slice(-2);
  }

  // String date
  const match = String(dob).match(/(\d{4})/);
  if (match) return match[1].slice(-2);

  return null;
};

// ==============================
// Admin / Clerk login
// ==============================
const findStaff = (rows, email, password, role) => {
  for (const r of rows) {
    const userId = String(r.UserID || r.UserId || "").trim();
    const name = String(r.Name || "").trim();
    const excelPassword = String(r.Password || "").trim();

    if (!userId || !excelPassword) continue;

    if (
      userId === String(email).trim() &&
      excelPassword === String(password).trim()
    ) {
      return { id: userId, name, role };
    }
  }
  return null;
};

// ==============================
// Student login
// ==============================
const findStudent = (rows, email, password) => {
  for (const r of rows) {
    const userId = String(r.UserID || r.UserId || "").trim();
    const name = String(r.Name || "").trim();
    const dob = r.DOB || r.DateOfBirth;

    if (!userId || !name || !dob) continue;

    const firstName = name.split(/\s+/)[0];
    const year = getYearSuffix(dob);
    if (!year) continue;

    const expectedPassword = `${firstName}${year}`;

    if (
      userId === String(email).trim() &&
      expectedPassword.toLowerCase() === String(password).trim().toLowerCase()
    ) {
      return { id: userId, name, role: "user" };
    }
  }
  return null;
};

// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    // ---- ADMIN ----
    const admin = findStaff(
      readExcel("admin.xlsx"),
      email,
      password,
      "admin"
    );
    if (admin) return sendToken(res, admin);

    // ---- CLERK ----
    const clerk = findStaff(
      readExcel("clerk.xlsx"),
      email,
      password,
      "clerk"
    );
    if (clerk) return sendToken(res, clerk);

    // ---- STUDENT ----
    const student = findStudent(
      readExcel("student.xlsx"),
      email,
      password
    );
    if (student) return sendToken(res, student);

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// Token helper
// ==============================
const sendToken = (res, user) => {
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.json({
    token,
    user,
  });
};
