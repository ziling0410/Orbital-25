import React from "react";
import ReactStars from "react-rating-stars-component";

export default function Review() {
    return (
        <div style={{ margin: "100px" }}>
            <h2>Star Rating Test</h2>
            <ReactStars
                count={5}
                size={30}
                isHalf={true}
                value={3.5}
                activeColor="#ffd700"
            />
        </div>
    );
}
