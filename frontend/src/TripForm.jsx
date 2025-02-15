import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { generateItinerary } from "./services/api";

const TripForm = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    destination: "",
    solo: null,
    time_slot: "",
    interests: [],
    budget: "",
    accessibility: false,
    restaurants: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const interestOptions = [
    "Historical Sites",
    "Museums",
    "Shopping",
    "Nature",
    "Adventure",
    "Cultural",
    "Religious",
    "Entertainment",
  ];

  const timeSlotOptions = [
    "Morning to Evening",
    "Evening to Night",
    "Full Day",
    "Half Day",
  ];

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const itinerary = await generateItinerary(formData);
      onSubmit(itinerary);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-purple-600">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-purple-600">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-purple-100 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <Card className="p-6 bg-white shadow-lg rounded-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-purple-800">
                Where are you heading?
              </h2>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => updateFormData("destination", e.target.value)}
                placeholder="Enter destination"
                className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-purple-800">
                Are you traveling solo?
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => updateFormData("solo", true)}
                  className={`flex-1 p-3 rounded-lg border transition-all ${
                    formData.solo === true
                      ? "bg-purple-600 text-white"
                      : "border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => updateFormData("solo", false)}
                  className={`flex-1 p-3 rounded-lg border transition-all ${
                    formData.solo === false
                      ? "bg-purple-600 text-white"
                      : "border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-purple-800">
                What's your preferred time?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {timeSlotOptions.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => updateFormData("time_slot", slot)}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.time_slot === slot
                        ? "bg-purple-600 text-white"
                        : "border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-purple-800">
                Select your interests
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.interests.includes(interest)
                        ? "bg-purple-600 text-white"
                        : "border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-purple-800">
                Additional Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-purple-200 rounded-lg">
                  <span>Accessibility Needed</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accessibility}
                      onChange={(e) =>
                        updateFormData("accessibility", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-purple-200 rounded-lg">
                  <span>Include Restaurants</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.restaurants}
                      onChange={(e) =>
                        updateFormData("restaurants", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <select
                  value={formData.budget}
                  onChange={(e) => updateFormData("budget", e.target.value)}
                  className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Budget Range</option>
                  <option value="low">Budget Friendly</option>
                  <option value="medium">Moderate</option>
                  <option value="high">Luxury</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50"
              >
                Previous
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ml-auto flex items-center ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate Schedule"
                )}
              </button>
            )}
          </div>
        </motion.div>
      </Card>
    </div>
  );
};

export default TripForm;
