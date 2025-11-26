import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import User from "../models/user.model.js";

export const createOrder = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.gigId);

        if (!gig) return res.status(404).send("Gig not found");

        if (gig.userId === req.userId) {
            return res.status(403).send("You cannot order your own gig");
        }

        const newOrder = new Order({
            gigId: gig._id,
            img: gig.cover,
            title: gig.title,
            price: gig.price,
            sellerId: gig.userId,
            buyerId: req.userId,
            status: "pending",
            isCompleted: false,
            payment_intent: "local_test",
        });

        await newOrder.save();
        return res.status(201).send(newOrder);
    } catch (err) {
        next(err);
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find(
            req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }
        );

        const finalOrders = await Promise.all(
            orders.map(async (order) => {
                let buyerName = "Unknown";
                let sellerName = "Unknown";

                if (mongoose.Types.ObjectId.isValid(order.buyerId)) {
                    const buyer = await User.findById(order.buyerId);
                    if (buyer) buyerName = buyer.username;
                }

                if (mongoose.Types.ObjectId.isValid(order.sellerId)) {
                    const seller = await User.findById(order.sellerId);
                    if (seller) sellerName = seller.username;
                }

                return {
                    ...order._doc,
                    buyerName,
                    sellerName,
                };
            })
        );

        res.status(200).send(finalOrders);
    } catch (err) {
        res.status(500).send("Order fetch failed");
    }
};

// ✅ CORRECT POSITION - outside all functions
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.status(200).send(order);
    } catch (err) {
        res.status(500).json(err);
    }
};