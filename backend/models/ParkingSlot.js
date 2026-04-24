const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: { type: String, required: true, unique: true },
    floor: { type: String, required: true },
    type: { type: String, enum: ["regular", "premium", "handicapped", "ev"], default: "regular" },
    status: { type: String, enum: ["available", "occupied", "reserved", "maintenance"], default: "available" },
    currentBooking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    pricePerHour: { type: Number, default: 50 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema);
