import React, { useState } from "react";
import TripForm from "./TripForm";
import TimelineScheduler from "./Timeline";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [itinerary, setItinerary] = useState(null);

  const handleFormSubmit = async (data) => {
    setItinerary(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <AnimatePresence mode="wait">
        {!itinerary ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TripForm onSubmit={handleFormSubmit} />
          </motion.div>
        ) : (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-end p-4">
              <button
                onClick={() => setItinerary(null)}
                className="px-4 py-2 text-purple-600 bg-white rounded-lg shadow hover:bg-purple-50"
              >
                Create New Itinerary
              </button>
            </div>
            <TimelineScheduler itineraryData={itinerary} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
