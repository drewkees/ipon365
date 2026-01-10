// CelebrationModal.tsx
import { X, PiggyBank, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  filledDays: number;  // Number of days filled in the piggy
  totalDays: number;   // Total days to fill
  amountSaved?: number; // Total amount saved (optional)
  dailyAmount?: number; // Amount saved per day (optional)
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  filledDays,
  totalDays,
  amountSaved,
  dailyAmount,
}) => {
  const [coins, setCoins] = useState<number[]>([]);
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCoins((prev) => [...prev, Date.now()]);
      }, 300);

      setTimeout(() => clearInterval(interval), 3000);

      return () => clearInterval(interval);
    } else {
      setCoins([]);
    }
  }, [isOpen]);

  // Incremental counter effect for amount
  useEffect(() => {
    if (isOpen && amountSaved) {
      setDisplayAmount(0);
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = amountSaved / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayAmount(amountSaved);
          clearInterval(timer);
        } else {
          setDisplayAmount(Math.floor(increment * currentStep));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isOpen, amountSaved]);

  const progress = Math.min(filledDays / totalDays, 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 w-96 flex flex-col items-center shadow-2xl"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Great Job!</h2>
            <p className="text-gray-600 mb-6">Keep saving for your goal! 🎯</p>

            {/* Piggy Bank with Coins */}
            <div className="relative w-40 h-40 mb-8">
              {/* Falling Coins */}
              {coins.map((coin) => (
                <motion.div
                  key={coin}
                  className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 top-0 left-1/2 -translate-x-1/2 shadow-lg"
                  initial={{ y: -30, x: Math.random() * 60 - 30, opacity: 1, scale: 1, rotate: 0 }}
                  animate={{ 
                    y: 100, 
                    x: 0,
                    opacity: 0, 
                    scale: 0.3,
                    rotate: 360
                  }}
                  transition={{ duration: 0.8, ease: "easeIn" }}
                  style={{
                    boxShadow: "0 4px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.5)"
                  }}
                >
                  <div className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-60" />
                </motion.div>
              ))}

              {/* Sparkles */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="text-yellow-400" size={32} />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-2 -left-2"
                animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Sparkles className="text-pink-400" size={28} />
              </motion.div>

              {/* Piggy Bank */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [-2, 2, -2]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <PiggyBank 
                  size={160} 
                  className="text-pink-400 drop-shadow-xl" 
                  style={{
                    filter: "drop-shadow(0 10px 15px rgba(236, 72, 153, 0.3))"
                  }}
                />
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
              <motion.div
                className="bg-gradient-to-r from-pink-400 to-purple-500 h-5 rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-30"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  style={{ width: "50%" }}
                />
              </motion.div>
            </div>

            {/* Progress Text */}
            <p className="mt-3 text-gray-700 font-bold text-lg">
              {filledDays} / {totalDays} days saved
            </p>

            {/* Amount Saved - Only show if amountSaved is provided */}
            {amountSaved !== undefined && (
              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm text-gray-500 mb-1">Total Saved</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                  ₱{displayAmount.toLocaleString()}
                </p>
                {dailyAmount !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    ₱{dailyAmount.toLocaleString()} per day
                  </p>
                )}
              </motion.div>
            )}
            
            {filledDays === totalDays && (
              <motion.p
                className="mt-2 text-purple-600 font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                🎉 Goal Complete! 🎉
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Demo Component
export default function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Savings Celebration Modal
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          🎉 Celebrate Your Savings!
        </button>
      </div>

      <CelebrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        filledDays={45}
        totalDays={365}
        amountSaved={45000}
        dailyAmount={1000}
      />
    </div>
  );
}