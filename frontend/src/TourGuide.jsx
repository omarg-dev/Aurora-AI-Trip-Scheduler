import React, { useState } from "react";
import Image from "next/image";

const AVATAR_STATES = [
  "/avatars/guide-neutral.png",
  "/avatars/guide-talking.png",
  "/avatars/guide-excited.png",
  "/avatars/guide-pointing.png",
];

const TourGuide = ({ currentLocation, onInteraction }) => {
  const [currentAvatar, setCurrentAvatar] = useState(0);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const cycleAvatar = () => {
    setCurrentAvatar((prev) => (prev + 1) % AVATAR_STATES.length);
  };

  const simulateGuideResponse = async (location) => {
    setIsTyping(true);
    // Simulate API call to get location-specific information
    const response = `Did you know that ${location} has some fascinating history? 
                         This area was first settled in...`;

    // Animate typing effect
    let tempMessage = "";
    for (let char of response) {
      tempMessage += char;
      setMessage(tempMessage);
      await new Promise((r) => setTimeout(r, 50));
      cycleAvatar();
    }
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-end gap-4">
      <div className="max-w-md bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <div className="mb-2 text-sm text-gray-500">
          {isTyping ? "Tour Guide is typing..." : "Your AI Tour Guide"}
        </div>
        <div className="prose prose-sm">
          {message ||
            "Hello! I'm your AI tour guide. What would you like to know about this area?"}
        </div>
      </div>

      <div className="relative w-32 h-32">
        <Image
          src={AVATAR_STATES[currentAvatar]}
          alt="AI Tour Guide"
          fill
          className="object-cover rounded-full transition-all duration-300 ease-out"
        />
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default TourGuide;
