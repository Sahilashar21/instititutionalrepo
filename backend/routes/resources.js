// routes/resources.js
const express = require("express");
const router = express.Router();

const resourceController = require("../controllers/resourceController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const modelMap = {
  "question-papers": require("../models/QuestionPaper"),
  "research-papers": require("../models/ResearchPaper"),
  // "syllabus": require("../models/Syllabus"),
};

// 📌 Get resources (with filters + pagination)
router.get("/:type", async (req, res) => {
  const type = req.params.type;
  const Model = modelMap[type];

  if (!Model) return res.status(400).json({ error: "Invalid resource type" });

  try {
    let { page = 1, limit = 10, ...filters } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};
    if (filters.title) query.title = filters.title;
    if (filters.year) query.year = filters.year;
    if (filters.course && filters.course !== "All") query.course = filters.course;
    if (filters.semester && filters.semester !== "All") query.semester = filters.semester;
    if (filters.subject) query.subject = { $regex: filters.subject, $options: "i" };
    if (filters.status && filters.status !== "All") query.status = filters.status;
    if (filters.link) query.link = { $regex: filters.link, $options: "i" };

    const total = await Model.countDocuments(query);
    const resources = await Model.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      resources,
    });
  } catch (err) {
    console.error("❌ Error fetching resources:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// // 📌 Update a resource (PUT /resources/:id)
// router.put(
//   "/:id",
//   authMiddleware,
//   roleMiddleware("admin"),
//   resourceController.updateResource
// );

// // 📌 Delete a resource (DELETE /resources/:id)
// router.delete(
//   "/:id",
//   authMiddleware,
//   roleMiddleware("admin"),
//   resourceController.deleteResource
// );

// Update a resource (no auth, dev mode)
router.put("/:type/:id", resourceController.updateResource);

// Delete a resource (no auth, dev mode)
router.delete("/:type/:id", resourceController.deleteResource);
module.exports = router;








// // routes/resources.js
// const express = require("express");
// const router = express.Router();

// const modelMap = {
//   "question-papers": require("../models/QuestionPaper"),
//   "research-papers": require("../models/ResearchPaper"),
  
//   // "syllabus": require("../models/Syllabus"),
// };

// router.get("/:type", async (req, res) => {
//   const type = req.params.type;
//   const Model = modelMap[type];

//   if (!Model) return res.status(400).json({ error: "Invalid resource type" });

//   try {
//     // Extract pagination params
//     let { page = 1, limit = 10, ...filters } = req.query;
//     page = parseInt(page);
//     limit = parseInt(limit);

//     // Build filter object
//     const query = {};
//     if(filters.title) query.title=filters.title;

//     // if (filters.accessionNo) query.accessionNo = filters.accessionNo;
//     if (filters.year) query.year = filters.year;
//     if (filters.course && filters.course !== "All") query.course = filters.course;
//     if (filters.semester && filters.semester !== "All") query.semester = filters.semester;
//     if (filters.subject) query.subject = { $regex: filters.subject, $options: "i" };
//     if (filters.status && filters.status !== "All") query.status = filters.status;
//     if (filters.link) query.link = { $regex: filters.link, $options: "i" };

//     // Fetch total count
//     const total = await Model.countDocuments(query);

//     // Fetch paginated results
//     const resources = await Model.find(query)
//       .sort({ updatedAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//     return res.json({
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//       resources,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching resources:", err);
//     return res.status(500).json({ error: "Internal Server Error", details: err.message });
//   }
// });

// // Update a resource (admin only)
// router.put("/:id", authMiddleware, roleMiddleware("admin"), resourceController.updateResource);

// // Delete a resource (admin only)
// router.delete("/:id", authMiddleware, roleMiddleware("admin"), resourceController.deleteResource);


// module.exports = router;







// // routes/resources.js

// const express = require("express");
// const router = express.Router();

// const modelMap = {
//   "question-papers": require("../models/QuestionPaper"),
//   "research-papers": require("../models/ResearchPaper"),
//   // "syllabus": require("../models/Syllabus"),
// };

// // GET /api/resources/:type?year=2024&course=CS
// router.get("/:type", async (req, res) => {
//   const type = req.params.type;
//   const Model = modelMap[type];

//   if (!Model) return res.status(400).json({ error: "Invalid resource type" });

//   try {
//     const query = { ...req.query };

//     // Always exclude "Demolished" for public view
//     // query.status = { $ne: "Demolished" };

//     const resources = await Model.find(query).sort({ updatedAt: -1 }); // newest first
//     return res.json({ resources });

//   } catch (err) {
//     console.error("❌ Error fetching resources:", err);
//     return res.status(500).json({ error: "Internal Server Error", details: err.message });
//   }
// });

// module.exports = router;
