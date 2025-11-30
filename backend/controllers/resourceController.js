// // backend/controllers/resourceController.js
// const modelMap = {
//   "question-papers": require("../models/QuestionPaper"),
//   "research-papers": require("../models/ResearchPaper"),
//   "syllabus": require("../models/Syllabus"),
//   // add any other mappings here
// };

// exports.updateResource = async (req, res) => {
//   try {
//     const { type, id } = req.params;
//     const Model = modelMap[type];

//     if (!Model) return res.status(400).json({ error: "Invalid resource type" });

//     // sanitize body: do not allow _id or system fields to be overwritten
//     const data = { ...req.body };
//     delete data._id;
//     delete data.__v;
//     delete data.createdAt;
//     delete data.updatedAt;

//     const updated = await Model.findByIdAndUpdate(id, data, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updated) return res.status(404).json({ error: "Resource not found" });

//     return res.json(updated);
//   } catch (err) {
//     console.error("❌ Error updating resource:", err);
//     if (err.name === "ValidationError") {
//       return res.status(400).json({ error: "Validation error", details: err.message });
//     }
//     return res.status(500).json({ error: "Internal Server Error", details: err.message });
//   }
// };

// exports.deleteResource = async (req, res) => {
//   try {
//     const { type, id } = req.params;
//     const Model = modelMap[type];

//     if (!Model) return res.status(400).json({ error: "Invalid resource type" });

//     const deleted = await Model.findByIdAndDelete(id);
//     if (!deleted) return res.status(404).json({ error: "Resource not found" });

//     return res.json({ message: "Resource deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting resource:", err);
//     return res.status(500).json({ error: "Internal Server Error", details: err.message });
//   }
// };



const QuestionPaper = require("../models/QuestionPaper");
const ResearchPaper = require("../models/ResearchPaper");

const modelMap = {
  "question-papers": QuestionPaper,
  "research-papers": ResearchPaper,
};

// UPDATE
exports.updateResource = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = modelMap[type];
    
    if (!Model) return res.status(400).json({ message: "Invalid resource type" });
    
    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Resource not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteResource = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = modelMap[type];
    
    if (!Model) return res.status(400).json({ message: "Invalid resource type" });
    
    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Resource not found" });
    res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: err.message });
  }
};
