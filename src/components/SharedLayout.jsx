import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import Navbar from "./Navbar";

const SharedLayout = ({ connectHandler, provider, account }) => {
  return (
    <div className="">
      <Navbar
        connectHandler={connectHandler}
        provider={provider}
        account={account}
      />
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};

export default SharedLayout;
