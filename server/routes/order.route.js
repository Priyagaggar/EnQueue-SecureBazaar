import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { updateOrderStatus, getOrders, createOrder } from "../controllers/order.controller.js";


const router = express.Router();

// Create a new order for a gig
router.post("/:gigId", verifyToken, createOrder);

// Get all orders for logged-in user
router.get("/", verifyToken, getOrders);
router.put("/status/:id", verifyToken, updateOrderStatus);
router.put("/status/:id", verifyToken, updateOrderStatus);



export default router;
