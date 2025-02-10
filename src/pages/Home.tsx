import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, AlertTriangle } from 'lucide-react';
import EmergencyMap from '../components/EmergencyMap';

const Home = () => {
  const [formData, setFormData] = useState({
    rainfall_mm: '',
    temp_max: '',
    temp_min: '',
    cumulative_3day_rain: '',
    cumulative_7day_rain: '',
    soil_moisture: '',
    river_level: ''
  });
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate prediction (replace with actual API call)
    setTimeout(() => {
      const randomPrediction = Math.random() > 0.5;
      setPrediction(randomPrediction ? 'High risk of flooding!' : 'Low risk of flooding');
      setShowMap(randomPrediction);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Background */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 3 }}
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&q=80")',
          filter: 'blur(5px)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <motion.div
            className="flex items-center gap-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Droplets className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-blue-900">FloodGuard Prediction</h1>
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
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name={key}
                      value={value}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                ))}
              </div>

              <motion.button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <Droplets className="w-5 h-5" />
                  </motion.div>
                ) : 'Predict'}
              </motion.button>
            </form>

            {prediction && !showMap && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                  prediction.includes('High') 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}
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

      {/* Back Button */}
      <motion.button
        onClick={() => {
          setShowMap(false);
          setPrediction(null);
        }}
        className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Back to Prediction
      </motion.button>
    </div>
  );
};

export default Home;