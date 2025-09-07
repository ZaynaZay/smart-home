import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/sonner"; // Using the correct Sonner component

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* Renders the current page */}
      </main>
      <Footer />
      <Toaster richColors /> {/* Toaster for notifications */}
    </div>
  );
};

export default MainLayout;
