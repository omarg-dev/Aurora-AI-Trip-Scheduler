const API_BASE_URL = "http://localhost:5000";

export const generateItinerary = async (formData) => {
  try {
    console.log("Sending data to backend:", formData);

    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate itinerary");
    }

    if (!data.itinerary) {
      throw new Error("No itinerary data received");
    }

    console.log("Received itinerary:", data.itinerary);
    return data.itinerary;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};
