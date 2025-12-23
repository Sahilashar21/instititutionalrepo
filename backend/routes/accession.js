const express = require("express");
const router = express.Router();

const Counter = require("../models/Counter");
const generateAccession = require("../utils/generateAccession");
const QuestionPaper = require("../models/QuestionPaper");
const ResearchPaper = require("../models/ResearchPaper");

/* CREATE QUESTION PAPER */
router.post("/question-papers", async (req, res) => {
  try {
    const accessionNumber = await generateAccession("question-papers");

    const doc = await QuestionPaper.create({
      ...req.body,
      accessionNumber,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* CREATE RESEARCH PAPER */
router.post("/research-papers", async (req, res) => {
  try {
    const accessionNumber = await generateAccession("research-papers");

    const doc = await ResearchPaper.create({
      ...req.body,
      accessionNumber,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PREVIEW ACCESSION (NO INCREMENT) */
router.get("/:type/preview-accession", async (req, res) => {
   console.log("🔥 PREVIEW ROUTE HIT", req.params.type);
  const prefixMap = {
    "question-papers": "QP",
    "research-papers": "RP",
  };

  const prefix = prefixMap[req.params.type];
  if (!prefix) return res.status(400).json({ error: "Invalid type" });

  const counter = await Counter.findById(prefix);
  const next = (counter?.sequence_value || 0) + 1;

  res.json({
    accessionNumber: `${prefix}${next.toString().padStart(3, "0")}`,
  });
});

module.exports = router;




// const express = require("express");
// const router = express.Router();

// const generateAccession = require("../utils/generateAccession");
// const Counter = require("../models/Counter");
// const QuestionPaper = require("../models/QuestionPaper");
// const ResearchPaper = require("../models/ResearchPaper");

// /* ===========================
//    CREATE QUESTION PAPER
// =========================== */
// router.post("/question-papers", async (req, res) => {
//   try {
//     const accessionNumber = await generateAccession("question-papers");

//     const doc = await QuestionPaper.create({
//       ...req.body,
//       accessionNumber,
//     });

//     res.status(201).json(doc);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /* ===========================
//    CREATE RESEARCH PAPER
// =========================== */
// router.post("/research-papers", async (req, res) => {
//   try {
//     const accessionNumber = await generateAccession("research-papers");

//     const doc = await ResearchPaper.create({
//       ...req.body,
//       accessionNumber,
//     });

//     res.status(201).json(doc);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// /* ===========================
//    PREVIEW ACCESSION (SAFE)
// =========================== */
// router.get("/:type/preview-accession", async (req, res) => {
//   const prefixMap = {
//     "question-papers": "QP",
//     "research-papers": "RP",
//   };

//   const prefix = prefixMap[req.params.type];
//   if (!prefix) {
//     return res.status(400).json({ error: "Invalid type" });
//   }

//   const counter = await Counter.findById(prefix);
//   const next = (counter?.sequence_value || 0) + 1;

//   res.json({
//     accessionNumber: `${prefix}${next.toString().padStart(3, "0")}`,
//   });
// });

// module.exports = router;



// // routes/accession.js

// const express = require("express");
// const router = express.Router();
// const generateAccession = require("../utils/generateAccession");


// router.post("/question-papers", async (req, res) => {
//   try {
//     const accessionNumber = await generateAccession("question-papers");

//     const doc = await QuestionPaper.create({
//       ...req.body,
//       accessionNumber,
//     });

//     res.status(201).json(doc);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post("/research-papers", async (req, res) => {
//   try {
//     const accessionNumber = await generateAccession("research-papers");

//     const doc = await ResearchPaper.create({
//       ...req.body,
//       accessionNumber,
//     });

//     res.status(201).json(doc);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.get("/:type/preview-accession", async (req, res) => {
//   const prefixMap = {
//     "question-papers": "QP",
//     "research-papers": "RP",
//   };

//   const prefix = prefixMap[req.params.type];
//   const counter = await Counter.findById(prefix);

//   const next = (counter?.sequence_value || 0) + 1;

//   res.json({
//     accessionNumber: `${prefix}${next.toString().padStart(3, "0")}`,
//   });
// });


// // router.get("/:type/next-accession", async (req, res) => {
// //   try {
// //     const { type } = req.params;

// //     const accessionNumber = await generateAccession(type);

// //     return res.json({ accessionNumber });
// //   } catch (err) {
// //     console.error("❌ Accession generation failed:", err);
// //     return res.status(400).json({ error: err.message });
// //   }
// // });

// module.exports = router;






// // routes/accession.js

// const express = require("express");
// const router = express.Router();

// const modelMap = {
//   "question-papers": require("../models/QuestionPaper"),
//   "research-papers": require("../models/ResearchPaper"),
//   // syllabus: require("../models/Syllabus"),
// };

// const prefixMap = {
//   "question-papers": "QP",
//   "research-papers": "RP",
//   syllabus: "SY",
// };

// router.get("/:type/next-accession", async (req, res) => {
//   const type = req.params.type;
//   const Model = modelMap[type];
//   const prefix = prefixMap[type];

//   if (!Model || !prefix) {
//     return res.status(400).json({ error: "Invalid resource type" });
//   }

//   try {
//     // ✅ Find the latest created document
//     const latest = await Model.findOne().sort({ createdAt: -1 });

//     let nextNumber = 1;

//     if (latest && latest.accessionNumber) {
//       const match = latest.accessionNumber.match(/\d+$/); // Extract number from end
//       if (match) {
//         nextNumber = parseInt(match[0], 10) + 1;
//       }
//     }

//     const paddedNumber = nextNumber.toString().padStart(3, "0");
//     const accessionNumber = `${prefix}${paddedNumber}`;

//     return res.json({ accessionNumber });
//   } catch (err) {
//     console.error("❌ Failed to fetch next accession number:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;

// const express = require("express");
// const router = express.Router();

// const modelMap = {
//   "question-papers": require("../models/QuestionPaper"),
//   "research-papers": require("../models/ResearchPaper"),
//   // "syllabus": require("../models/Syllabus"), // Uncomment when model is ready
// };

// const prefixMap = {
//   "question-papers": "QP",
//   "research-papers": "RP",
//   "syllabus": "SY",
// };

// router.get("/:type/next-accession", async (req, res) => {
//   const type = req.params.type;
//   const Model = modelMap[type];
//   const prefix = prefixMap[type];

//   if (!Model || !prefix) {
//     return res.status(400).json({ error: "Invalid resource type" });
//   }

//   try {
//     // 🔍 Find latest document by accessionNumber (descending)
//     const latestDoc = await Model.findOne().sort({ accessionNumber: -1 });

//     let nextNumber;

//     if (latestDoc && latestDoc.accessionNumber) {
//       // 🧠 Extract the numeric part from the last accession number
//       const match = latestDoc.accessionNumber.match(/\d+$/);
//       const lastNumber = match ? parseInt(match[0], 10) : 0;
//       nextNumber = (lastNumber + 1).toString().padStart(3, "0");
//     } else {
//       // If no records found, start from 001
//       nextNumber = "001";
//     }

//     const accessionNumber = `${prefix}${nextNumber}`;

//     return res.json({ accessionNumber });
//   } catch (err) {
//     console.error("❌ Error generating accession number:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;

// const express = require("express");
// const router = express.Router();

// const modelMap = {
//   "question-papers": require("../models/QuestionPaper"),
//   "research-papers": require("../models/ResearchPaper"),
//   //syllabus: require("../models/Syllabus"),
//   // Add others
// };

// const prefixMap = {
//   "question-papers": "QP",
//   "research-papers": "RP",
//   syllabus: "SY",
// };

// router.get("/:type/next-accession", async (req, res) => {
//   const type = req.params.type;
//   const Model = modelMap[type];
//   const prefix = prefixMap[type];

//   if (!Model || !prefix) return res.status(400).json({ error: "Invalid type" });

//   const count = await Model.countDocuments();
//   const nextNumber = (count + 1).toString().padStart(3, "0");
//   const accessionNumber = `${prefix}${nextNumber}`;

//   res.json({ accessionNumber });
// });

// module.exports = router;
