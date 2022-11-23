import React from "react";

import { Navbar } from "./Navbar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar />
      <div className="flex-1 overflow-scroll">{children}</div>
    </div>
  );
};
