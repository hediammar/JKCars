import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoLoader from "@/components/VideoLoader";
import Home from "@/pages/Home";
import Fleet from "@/pages/Fleet";
import CarDetails from "@/pages/CarDetails";
import Excursions from "@/pages/Excursions";
import ExcursionDetails from "@/pages/ExcursionDetails";
import AirportTransfers from "@/pages/AirportTransfers";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Booking from "@/pages/Booking";
import SearchResults from "@/pages/SearchResults";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/AdminDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/fleet" component={Fleet} />
      <Route path="/car/:id" component={CarDetails} />
      <Route path="/excursions" component={Excursions} />
      <Route path="/excursion/:id" component={ExcursionDetails} />
      <Route path="/airport-transfers" component={AirportTransfers} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/booking" component={Booking} />
      <Route path="/search" component={SearchResults} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showVideo, setShowVideo] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  const handleVideoEnd = () => {
    setShowVideo(false);
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setContentVisible(true);
    }, 100);
  };

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {showVideo && <VideoLoader onVideoEnd={handleVideoEnd} />}
          <div
            className={`min-h-screen flex flex-col transition-opacity duration-800 ease-in-out ${
              contentVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{ transitionDuration: "800ms" }}
          >
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
