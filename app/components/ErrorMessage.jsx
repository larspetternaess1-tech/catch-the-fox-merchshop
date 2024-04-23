import React from "react";

const ErrorMessage = ({ message }) => {
    if (!message) return null; // Don't render anything if there's no message

    return (
        <div className="bg-clrdark text-[#ff4040] p-2 text-xs italic font-bold">
            <span>{message}</span>
        </div>
    );
};

export default ErrorMessage;
