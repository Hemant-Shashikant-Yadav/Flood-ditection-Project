import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, AlertTriangle, MapPin } from "lucide-react";
import EmergencyMap from "../components/EmergencyMap";

const Home = () => {
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

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

  const triggerFloodCondition = () => {
    setPrediction("Emergency: Critical flood conditions detected!");
    setShowMap(true);
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <motion.div
            className="flex items-center gap-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Droplets className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-blue-900">
              FloodGuard Monitoring
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
