const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const ParkingSlot = require("../models/ParkingSlot");
const { protect, adminOnly } = require("../middleware/auth");

// POST /api/bookings - create booking
router.post("/", protect, async (req, res) => {
  const { slotId, vehicleNumber, vehicleType, bookingType } = req.body;
  try {
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.status !== "available")
      return res.status(400).json({ message: "Slot not available" });

    const booking = await Booking.create({
      user: req.user._id,
      slot: slotId,
      vehicleNumber: vehicleNumber || req.user.vehicleNumber,
      vehicleType,
      bookingType,
      entryTime: new Date(),
    });

    slot.status = bookingType === "reserved" ? "reserved" : "occupied";
    slot.currentBooking = booking._id;
    await slot.save();

    res.status(201).json(await booking.populate("slot user", "-password"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bookings/:id/checkout - exit vehicle
router.put("/:id/checkout", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("slot");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "active")
      return res.status(400).json({ message: "Booking already completed" });

    booking.checkout();
    await booking.save();

    const slot = await ParkingSlot.findById(booking.slot._id);
    slot.status = "available";
    slot.currentBooking = null;
    await slot.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/my - user's own bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("slot")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings - all bookings (admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("slot")
      .populate("user", "name email vehicleNumber")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/stats - admin stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const active = await Booking.countDocuments({ status: "active" });
    const completed = await Booking.countDocuments({ status: "completed" });
    const cancelled = await Booking.countDocuments({ status: "cancelled" });
    const revenueData = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const revenue = revenueData[0]?.total || 0;
    res.json({ total, active, completed, cancelled, revenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/bookings/:id - cancel booking
router.delete("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    booking.status = "cancelled";
    await booking.save();

    const slot = await ParkingSlot.findById(booking.slot);
    if (slot) { slot.status = "available"; slot.currentBooking = null; await slot.save(); }

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
