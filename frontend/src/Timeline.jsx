import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import AudioVisualizer from "./components/AudioVisualizer";

const TimelineScheduler = ({ itineraryData, isLoading, error }) => {
  const scrollContainerRef = useRef(null);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    let lastScrollTop = 0;

    const handleScroll = () => {
      if (!container) return;

      const st = container.scrollTop;
      const direction = st > lastScrollTop ? 1 : -1;
      const cardHeight = container.clientHeight;
      const currentCard = Math.round(st / cardHeight);

      container.scrollTo({
        top: currentCard * cardHeight,
        behavior: "smooth",
      });

      lastScrollTop = st;
    };

    container?.addEventListener("scrollEnd", handleScroll);

    // Debounced scroll handler
    let scrollTimeout;
    container?.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 50);
    });

    return () => {
      container?.removeEventListener("scrollEnd", handleScroll);
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center text-red-600">
        <p>Error loading itinerary: {error}</p>
      </div>
    );
  }

  if (!itineraryData || itineraryData.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600">
          No itinerary data available. Please generate an itinerary first.
        </p>
      </div>
    );
  }

  const scheduleData =
    itineraryData?.map((item) => ({
      time: item.time_slot,
      title: item.location_name, // Changed from location to location_name
      description: item.text,
      duration: item.time_slot,
      image: item.image_url || "/placeholder-image.jpg",
      cost: item.price || "Free", // Added price from backend
      website: item.website || "#", // Added website from backend
      details: {
        address: item.exact_location, // Changed to exact_location
        rating: item.rating || 4.5, // Added rating from backend
        bestTime: item.time_slot,
        facilities: item.interests || [], // Changed to interests
      },
      audioDescription: item.tts_filename,
    })) || [];

  const getCardHeight = (duration) => {
    const [hours] = duration.split(":").map(Number);
    return `${100 + hours * 40}px`;
  };

  const getGradientColor = (duration) => {
    const [hours] = duration.split(":").map(Number);
    if (hours >= 3) return "from-purple-500 to-indigo-500";
    if (hours >= 2) return "from-blue-500 to-purple-500";
    return "from-pink-500 to-purple-500";
  };

  const lineVariants = {
    hidden: { height: 0 },
    visible: {
      height: "100%",
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 bg-gray-50 rounded-xl relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1 }}
          className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"
        />

        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute h-32 w-32 rounded-full border-8 border-purple-100/20 -top-16 -right-16" />
        <div className="absolute h-16 w-16 rounded-full border-4 border-pink-100/20 bottom-8 right-8" />
        <div className="absolute h-24 w-24 rounded-full border-6 border-indigo-100/20 top-1/2 -left-12" />
      </div>

      <div
        ref={scrollContainerRef}
        className="h-[700px] overflow-y-auto px-2 sm:px-4 relative scroll-smooth snap-y snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="relative">
          {/* Timeline line with adjusted position */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={lineVariants}
            className="absolute left-12 sm:left-20 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 to-pink-300 rounded-full"
          />

          {scheduleData.map((item, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-100px" }}
              variants={itemVariants}
              className="flex items-start mb-8 sm:mb-12 h-[700px] snap-start snap-always"
            >
              {/* Adjusted time number spacing */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-12 sm:w-20 pt-3 pr-4 text-right flex-shrink-0"
              >
                <span className="font-semibold text-purple-700 text-sm sm:text-base">
                  {item.time}
                </span>
              </motion.div>

              {/* Adjusted dot position */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute left-0 top-4 w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full -ml-1.5 sm:-ml-2 shadow-lg"
                >
                  <div className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full top-[3px] left-[3px] sm:top-1 sm:left-1"></div>
                </motion.div>
              </div>

              {/* Card container with adjusted margin */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="ml-6 sm:ml-8 w-full"
              >
                <Card
                  className="p-0 w-full max-w-[calc(100vw-100px)] sm:max-w-lg transition-all duration-300 hover:shadow-xl
                        hover:translate-x-1 hover:-translate-y-1 overflow-hidden"
                  style={{
                    minHeight: getCardHeight(item.duration),
                  }}
                >
                  <div className="h-full flex flex-col">
                    <div className="h-32 sm:h-48 relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 px-2 sm:px-3 py-1 rounded-full">
                        <span className="text-purple-600 font-bold text-sm sm:text-base">
                          {item.cost}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-5 flex-1 bg-gradient-to-br from-purple-500 to-indigo-500">
                      <div className="text-white">
                        <h3 className="font-bold text-lg sm:text-xl mb-2">
                          {item.title}
                        </h3>
                        <p className="text-white/90 mb-3 text-sm sm:text-base">
                          {item.description}
                        </p>

                        <div className="flex items-center space-x-2 sm:space-x-4 mb-3 flex-wrap">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm sm:text-base">
                              {item.time} ({item.duration})
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {Array.from({
                              length: Math.floor(item.details.rating),
                            }).map((_, i) => (
                              <svg
                                key={i}
                                className="w-4 h-4 text-yellow-300"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                          {item.details.facilities.map((facility, i) => (
                            <span
                              key={i}
                              className="bg-white/20 px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs sm:text-sm mb-2">
                          📍 {item.details.address}
                        </p>
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                               text-xs sm:text-sm font-medium transition-colors"
                        >
                          Visit Website →
                        </a>
                      </div>
                    </div>

                    {/* Replace the existing audio control section with this */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        {/* Modern Audio Player */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              setCurrentPlayingAudio(
                                currentPlayingAudio === index ? null : index
                              )
                            }
                            className={`group flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                              currentPlayingAudio === index
                                ? "bg-purple-800 text-white"
                                : "bg-white hover:bg-purple-100 text-purple-600 hover:text-purple-700 border border-purple-200"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm">
                              {currentPlayingAudio === index ? (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4 ml-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                          {/* Audio Visualizer */}
                          <AudioVisualizer
                            isPlaying={currentPlayingAudio === index}
                            audioUrl={item.audioDescription}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Optional: Add navigation dots */}
      <div className="flex justify-center gap-2 mt-4">
        {scheduleData.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              scrollContainerRef.current?.scrollTo({
                top: index * 700,
                behavior: "smooth",
              });
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              Math.round(scrollContainerRef.current?.scrollTop ?? 0) / 700 ===
              index
                ? "bg-purple-500 w-4"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Add these keyframes to your global CSS or styling solution
const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;

export default TimelineScheduler;
