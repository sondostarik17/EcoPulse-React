
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-800 transition-colors duration-300 dark:bg-gray-900 dark:text-white">
      <Navbar />

      <main
        key={location.pathname}
        className="flex-1 bg-inherit text-inherit transition-colors duration-300"
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
