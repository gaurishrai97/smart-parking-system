const express = require("express");
const router = express.Router();
const ParkingSlot = require("../models/ParkingSlot");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/slots - get all slots (public)
router.get("/", async (req, res) => {
  try {
    const slots = await ParkingSlot.find().populate("currentBooking");
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/slots/available
router.get("/available", async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ status: "available" });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/slots/stats
router.get("/stats", async (req, res) => {
  try {
    const total = await ParkingSlot.countDocuments();
    const available = await ParkingSlot.countDocuments({ status: "available" });
    const occupied = await ParkingSlot.countDocuments({ status: "occupied" });
    const reserved = await ParkingSlot.countDocuments({ status: "reserved" });
    const maintenance = await ParkingSlot.countDocuments({ status: "maintenance" });
    res.json({ total, available, occupied, reserved, maintenance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/slots - create slot (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const slot = await ParkingSlot.create(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/slots/:id - update slot (admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    res.json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/slots/:id - delete slot (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await ParkingSlot.findByIdAndDelete(req.params.id);
    res.json({ message: "Slot removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/slots/seed - seed initial slots (admin)
router.post("/seed", protect, adminOnly, async (req, res) => {
  try {
    await ParkingSlot.deleteMany({});
    const floors = ["G", "1", "2"];
    const slots = [];
    floors.forEach((floor) => {
      for (let i = 1; i <= 10; i++) {
        const num = `${floor}-${String(i).padStart(2, "0")}`;
        const types = ["regular", "regular", "regular", "regular", "premium", "regular", "regular", "handicapped", "ev", "regular"];
        slots.push({ slotNumber: num, floor, type: types[i - 1], status: "available", pricePerHour: types[i - 1] === "premium" ? 100 : 50 });
      }
    });
    const created = await ParkingSlot.insertMany(slots);
    res.status(201).json({ message: `${created.length} slots seeded`, slots: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
