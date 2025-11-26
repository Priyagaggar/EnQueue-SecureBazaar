import React from "react";
import { useParams } from "react-router-dom";
import "../styles/Message.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import profilePic from "../assets/undraw_Male_avatar.png";

const Message = () => {
    const { id } = useParams();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const queryClient = useQueryClient();

    // ✅ GET CONVERSATION (for names)
    const { data: conversation } = useQuery({
        queryKey: ["conversation", id],
        queryFn: () =>
            newRequest.get(`/conversations/single/${id}`).then((res) => res.data),
    });

    // ✅ GET MESSAGES
    const { isLoading, error, data } = useQuery({
        queryKey: ["messages", id],
        queryFn: () =>
            newRequest.get(`/messages/${id}`).then((res) => res.data),
    });

    const mutation = useMutation({
        mutationFn: (message) => {
            return newRequest.post(`/messages`, message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["messages", id]);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({
            conversationId: id,
            desc: e.target[0].value,
        });
        e.target[0].value = "";
    };

    return (
        <div className="message">
            <div className="messageContainer">

                {/* ✅ SHOW NAME */}
                {conversation && (
                    <h2 style={{ marginBottom: "15px" }}>
                        Chat with{" "}
                        {currentUser.seller
                            ? conversation.buyerName
                            : conversation.sellerName}
                    </h2>
                )}

                {isLoading ? (
                    "loading"
                ) : error ? (
                    "error"
                ) : (
                    <div className="chat">
                        {data.map((m) => (
                            <div
                                className={m.userId === currentUser._id ? "owner item" : "item"}
                                key={m._id}
                            >
                                <img src={profilePic} alt="" />
                                <p>{m.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                <hr />
                <form className="write" onSubmit={handleSubmit}>
                    <textarea placeholder="Write a message" />
                    <button type="submit" className="Buttons">Send</button>
                </form>
            </div>
        </div>
    );
};

export default Message;
