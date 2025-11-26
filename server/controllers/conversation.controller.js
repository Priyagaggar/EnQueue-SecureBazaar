import mongoose from "mongoose";
import createError from "../utils/createError.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

export const createConversation = async (req, res, next) => {
  const newConversation = new Conversation({
    id: req.isSeller ? req.userId + req.body.to : req.body.to + req.userId,
    sellerId: req.isSeller ? req.userId : req.body.to,
    buyerId: req.isSeller ? req.body.to : req.userId,
    readBySeller: req.isSeller,
    readByBuyer: !req.isSeller,
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(201).send(savedConversation);
  } catch (err) {
    next(err);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          // readBySeller: true,
          // readByBuyer: true,
          ...(req.isSeller ? { readBySeller: true } : { readByBuyer: true }),
        },
      },
      { new: true }
    );

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

export const getSingleConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Not found!"));
    res.status(200).send(conversation);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            $or: [
                { sellerId: req.userId },
                { buyerId: req.userId }
            ]
        }).sort({ updatedAt: -1 });

        const finalConversations = await Promise.all(
            conversations.map(async (conv) => {
                let buyerName = "Unknown";
                let sellerName = "Unknown";

                if (mongoose.Types.ObjectId.isValid(conv.buyerId)) {
                    const buyer = await User.findById(conv.buyerId);
                    if (buyer) buyerName = buyer.username;
                }

                if (mongoose.Types.ObjectId.isValid(conv.sellerId)) {
                    const seller = await User.findById(conv.sellerId);
                    if (seller) sellerName = seller.username;
                }

                return {
                    ...conv._doc,
                    buyerName,
                    sellerName,
                };
            })
        );

        res.status(200).json(finalConversations);
    } catch (error) {
        console.error(error);
        res.status(500).json("Failed to fetch conversations");
    }
};
