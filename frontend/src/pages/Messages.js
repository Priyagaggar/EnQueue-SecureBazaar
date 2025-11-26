import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Messages.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";

const Messages = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const navigate = useNavigate(); // ✅ ADDED

    const queryClient = useQueryClient();

    const { isLoading, error, data } = useQuery({
        queryKey: ["conversations"],
        queryFn: () =>
            newRequest.get(`/conversations`).then((res) => res.data),
    });

    const mutation = useMutation({
        mutationFn: (id) => {
            return newRequest.put(`/conversations/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["conversations"]);
        },
    });

    const handleRead = (id) => {
        mutation.mutate(id);
    };

    return (
        <div className="messages">
            {isLoading ? (
                <div className="loadingPlaceholder">
                    <div className="spinner"></div>
                    <div>Loading messages...</div>
                </div>
            ) : error ? (
                <div className="loadingPlaceholder">
                    <div className="errorMessage">
                        Sorry, something went wrong while loading your messages.
                    </div>
                </div>
            ) : (
                <div className="messagesContainer">
                    <div className="messagesTitle">
                        <h1>Messages</h1>
                    </div>

                    {data.length === 0 ? (
                        <div className="noMessages">
                            You don’t have any messages yet.
                            <br />
                            Start a conversation from the{" "}
                            <Link to="/orders" className="link">
                                Orders
                            </Link>{" "}
                            page.
                        </div>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th>{currentUser.seller ? "Buyer" : "Seller"}</th>
                                <th>Last Message</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                            </thead>

                            <tbody>
                            {data.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        {currentUser.seller ? c.buyerName : c.sellerName}
                                    </td>

                                    <td>{c.lastMessage}</td>

                                    <td>{new Date(c.updatedAt).toLocaleString()}</td>

                                    <td>
                                        <button
                                            className="Buttons"
                                            onClick={() => {
                                                handleRead(c.id);
                                                navigate(`/message/${c.id}`);
                                            }}
                                        >
                                            Open
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default Messages;
