// apps/backend/src/api/routes.ts
import { Router } from "express";
import { storeDataStore } from "../models/store";

const router = Router();

// GET /api/stores - Get all store states
router.get("/stores", (req, res) => {
  try {
    const storeStates = storeDataStore.getAllStoreStates();
    res.json({ data: storeStates, total: storeStates.length });
  } catch (error) {
    console.error("Error fetching store states", error);
    res.status(500).json({ error: "Failed to fetch store states" });
  }
});

// GET /api/stores/:id - Get a specific store state
router.get("/stores/:id", (req, res) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    if (isNaN(storeId)) {
      return res.status(400).json({ error: "Invalid store ID" });
    }

    const storeStates = storeDataStore.getAllStoreStates();
    const store = storeStates.find((s) => s.store_id === storeId);

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json({ data: store });
  } catch (error) {
    console.error("Error fetching store state", error);
    res.status(500).json({ error: "Failed to fetch store state" });
  }
});

// GET /api/history - Get historical data for all stores
router.get("/history", (req, res) => {
  try {
    // Check if store_id query parameter exists
    const storeIdParam = req.query.store_id;
    const storeId = storeIdParam
      ? parseInt(storeIdParam as string, 10)
      : undefined;

    // If store_id is provided but invalid, return 400
    if (storeIdParam && isNaN(storeId!)) {
      return res.status(400).json({ error: "Invalid store ID" });
    }

    const historicalData = storeDataStore.getHistoricalData(storeId);
    res.json({ data: historicalData, total: historicalData.length });
  } catch (error) {
    console.error("Error fetching historical data", error);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
});

// GET /api/latest-event - Get the latest customer traffic event
router.get("/latest-event", (req, res) => {
  try {
    const latestEvent = storeDataStore.getLatestEvent();
    if (!latestEvent) {
      return res.status(404).json({ error: "No events found" });
    }

    res.json({ data: latestEvent });
  } catch (error) {
    console.error("Error fetching latest event", error);
    res.status(500).json({ error: "Failed to fetch latest event" });
  }
});

export default router;
