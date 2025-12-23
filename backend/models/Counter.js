// // models/Counter.js
// const mongoose = require("mongoose");

// const counterSchema = new mongoose.Schema({
//   resourceType: { type: String, required: true, unique: true },
//   nextNumber: { type: Number, default: 1 },
// });

// module.exports = mongoose.model("Counter", counterSchema);

// backend/models/Counter.js
// const mongoose = require("mongoose");

// const counterSchema = new mongoose.Schema({
//   _id: { type: String }, // e.g., QP, RP
//   sequence_value: { type: Number, default: 0 },
// });

// module.exports = mongoose.model("Counter", counterSchema);
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: {
    type: String, // QP, RP, SY
    required: true,
  },
  sequence_value: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Counter", counterSchema);

