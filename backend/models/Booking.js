const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSlot", required: true },
    vehicleNumber: { type: String, required: true },
    vehicleType: { type: String, enum: ["car", "bike", "truck", "ev"], default: "car" },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // in hours
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
    bookingType: { type: String, enum: ["walkin", "reserved"], default: "walkin" },
  },
  { timestamps: true }
);

// Auto-calculate duration and amount on exit
bookingSchema.methods.checkout = function () {
  this.exitTime = new Date();
  const ms = this.exitTime - this.entryTime;
  this.duration = Math.ceil(ms / (1000 * 60 * 60)); // round up to nearest hour
  this.totalAmount = this.duration * 50;
  this.status = "completed";
};

module.exports = mongoose.model("Booking", bookingSchema);
