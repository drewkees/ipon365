// CelebrationModal.tsx
import { X, PiggyBank, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  filledDays: number;  // Number of days filled in the piggy
  totalDays: number;   // Total days to fill
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  filledDays,
  totalDays,
}) => {
  const [coins, setCoins] = useState<number[]>([]);

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