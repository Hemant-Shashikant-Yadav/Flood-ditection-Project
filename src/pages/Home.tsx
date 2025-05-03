import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, AlertTriangle, MapPin, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmergencyMap from "../components/EmergencyMap";

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    latitude: "",
    longitude: "",
    rainfall: "",
    temperature: "",
    humidity: "",
    riverDischarge: "",
    waterLevel: "",
    elevation: "",
  });
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPEN_WEATHER_API_KEY;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude.toFixed(6);
          const longitude = position.coords.longitude.toFixed(6);

          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));

          // Fetch weather data
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://192.168.237.14")
        .then((res) => res.json())
        .then((data) => {
          console.log("Water level:", data.value);
          setFormData((prev) => ({
            ...prev,
            waterLevel: data.value.toString(), // Update water level in formData
          }));
        })
        .catch(console.error);
    }, 3000); // Fetch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async (latitude: string, longitude: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPEN_WEATHER_API_KEY}`
      );
      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          temperature: data.main.temp.toFixed(1),
          humidity: data.main.humidity.toString(),
          rainfall: data.rain ? data.rain["1h"] || "0" : "0",
        }));
      } else {
        console.error("Error fetching weather data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    navigate("/auth"); // Redirect to the login page
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setPrediction("High risk of flooding!");
      setShowMap(true);
      setLoading(false);
    }, 1500);
  };

  const triggerFloodCondition = async () => {
    setPrediction("Emergency: Critical flood conditions detected!");
    setShowMap(true);

    // Send email notification
    try {
      const userEmail = localStorage.getItem("userEmail"); // Assuming the user's email is stored in localStorage
      if (!userEmail) {
        console.error("User email not found");
        return;
      }

      const response = await fetch(
        "https://server-nu-indol.vercel.app/api/email/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            subject: "Flood Alert Notification",
            message: `
            Emergency Alert: A flood condition has been detected in your area. Please take immediate precautions to ensure your safety.

            General Safety Tips:
            - Move to higher ground immediately.
            - Avoid walking or driving through floodwaters.
            - Keep emergency supplies, including food, water, and medications, ready.

            Emergency Contacts:
            - National Disaster Management: 011-26701700, Help Line Number : 011-1078
            - Police: 100
            - Fire Department: 101
            - Ambulance: 102
            - Emergency: 112

            Stay safe and follow updates from local authorities.
          `,
          }),
        }
      );

      if (response.ok) {
        console.log("Flood notification email sent successfully!");
      } else {
        console.error("Failed to send flood notification email");
      }
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <motion.div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 3 }}
        style={{
          backgroundImage:
            'url("https://images.pexels.com/photos/1433052/pexels-photo-1433052.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")',
          filter: "blur(5px)",
        }}
      />

      {/* Logout Button */}
      <motion.button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <LogOut className="w-5 h-5" />
        Logout
      </motion.button>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <motion.div
            className="flex items-center gap-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Droplets className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-blue-900">
              HydroShield Monitoring
            </h1>
          </motion.div>
        </div>

        {!showMap ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 backdrop-blur-lg bg-white/90"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude{" "}
                      <MapPin className="inline-block w-4 h-4 text-blue-500" />
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude{" "}
                      <MapPin className="inline-block w-4 h-4 text-blue-500" />
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                {[
                  "rainfall",
                  "temperature",
                  "humidity",
                  "riverDischarge",
                  "waterLevel",
                  "elevation",
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.charAt(0).toUpperCase() +
                        field.slice(1).replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <motion.button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="inline-block"
                    >
                      <Droplets className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    "Monitor Conditions"
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={triggerFloodCondition}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Trigger Flood Alert
                </motion.button>
              </div>
            </form>

            {prediction && !showMap && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg flex items-center gap-3 bg-red-100 text-red-800"
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{prediction}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-[calc(100vh-200px)] rounded-xl overflow-hidden shadow-lg"
          >
            <EmergencyMap />
          </motion.div>
        )}
      </div>

      <motion.button
        onClick={() => {
          setShowMap(false);
          setPrediction(null);
        }}
        className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Monitoring
      </motion.button>
    </div>
  );
};

export default Home;
