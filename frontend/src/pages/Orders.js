import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Orders.css";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import messageIcon from "../assets/chat-icon.png";

const Orders = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const navigate = useNavigate();

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["orders"],
        queryFn: () => newRequest.get(`/orders`).then((res) => res.data),
    });

    const handleContact = async (order) => {
        const id = order.sellerId + order.buyerId;

        try {
            const res = await newRequest.get(`/conversations/single/${id}`);
            navigate(`/message/${res.data.id}`);
        } catch (err) {
            if (err.response.status === 404) {
                const res = await newRequest.post(`/conversations/`, {
                    to: currentUser.seller ? order.buyerId : order.sellerId,
                });
                navigate(`/message/${res.data.id}`);
            }
        }
    };

    // ✅ STATUS UPDATE FUNCTION
    const updateStatus = async (id, status) => {
        try {
            await newRequest.put(`/orders/status/${id}`, { status });
            refetch();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="orders">
            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error loading orders</p>
            ) : (
                <div className="ordersContainer">
                    <h1>Orders</h1>

                    <table>
                        <thead>
                        <tr>
                            <th>Buyer</th>
                            <th>Seller</th>
                            <th>Title</th>
                            <th>Image</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Contact</th>
                        </tr>
                        </thead>

                        <tbody>
                        {data.map((order) => (
                            <tr key={order._id}>
                                <td>{order.buyerName}</td>
                                <td>{order.sellerName}</td>
                                <td>{order.title}</td>
                                <td>
                                    <img className="image" src={order.img} alt="" />
                                </td>
                                <td>₹ {order.price}</td>

                                {/* ✅ STATUS COLUMN */}
                                <td>
                                    {order.status === "pending" && currentUser.seller ? (
                                        <>
                                            <button
                                                className="Buttons acceptBtn"
                                                onClick={() => updateStatus(order._id, "accepted")}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="Buttons rejectBtn"
                                                onClick={() => updateStatus(order._id, "rejected")}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className={`status ${order.status}`}>
                        {order.status.toUpperCase()}
                      </span>
                                    )}
                                </td>

                                <td>
                                    <img
                                        className="orderContact"
                                        src={messageIcon}
                                        alt=""
                                        onClick={() => handleContact(order)}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;
