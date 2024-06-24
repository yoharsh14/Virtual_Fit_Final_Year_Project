import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0f0f0f] relative text-white">
      <div className="absolute h-[20rem] w-[20rem] rounded-full bg-blue-500 blur-[16rem] z-[1]"></div>
      <div className="text-center z-[4]">
        <h1 className="text-4xl font-bold mb-4">Welcome to Virtual Fit</h1>
        <p className="text-lg mb-8">
          Experience the future of shopping with our AR-based solution. Try on
          clothes virtually and customize them using 3D models.
        </p>
        <Link to="/explore">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
