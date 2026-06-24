import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => setVisible(false), 600);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900"
        initial={{ opacity: 1 }}
        animate={{ opacity: fading ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-48 h-48" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0, -5)">
              <g>
                <path d="M 100,20 A 60 60 0 1 1 40,100" fill="none" stroke="#0d3d56" strokeWidth="6" strokeLinecap="round" />
                <path d="M 100,20 A 60 60 0 1 0 160,100" fill="none" stroke="#48a9a6" strokeWidth="6" strokeLinecap="round" />
              </g>
              <g>
                <path d="M 50 45 H 150" stroke="#f2a104" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M 100 45 V 30" stroke="#0d3d56" strokeWidth="3.5" />
                <circle cx="100" cy="27" r="3" fill="#f2a104" />
              </g>
              <g>
                <path d="M 70 110 C 70 90, 90 85, 100 85 C 110 85, 130 90, 130 110 L 130 50 L 70 50 Z" fill="#0d3d56" />
                <path d="M 100 52 V 108" stroke="#48a9a6" strokeWidth="2.5" />
                <g stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.7">
                  <path d="M 78 65 H 95" /><path d="M 78 72 H 95" /><path d="M 78 79 H 95" />
                  <path d="M 105 65 H 122" /><path d="M 105 72 H 122" /><path d="M 105 79 H 122" />
                </g>
              </g>
              <g transform="rotate(-30 95 90)">
                <circle cx="95" cy="90" r="8" fill="rgba(255,255,255,0.2)" stroke="#48a9a6" strokeWidth="2.5" />
                <line x1="102" y1="97" x2="108" y2="103" stroke="#48a9a6" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
            <g textAnchor="middle" fontFamily="Poppins, Arial, sans-serif">
              <text y="170" x="100" fontSize="22" fontWeight="600">
                <tspan fill="#0d3d56">Nyay</tspan><tspan fill="#48a9a6">Sarathi</tspan>
              </text>
              <text y="185" x="100" fontSize="10" fontWeight="500" fill="#555555" letterSpacing="0.5">
                DEMYSTIFY LEGAL DOCUMENTS
              </text>
            </g>
          </svg>
        </motion.div>
        <div className="flex items-center text-gray-500 dark:text-gray-400 mt-6">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm">Secured by Claritas Tech</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
