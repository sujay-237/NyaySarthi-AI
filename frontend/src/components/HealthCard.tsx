import { motion } from "framer-motion";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { type HealthRating } from "../types";

interface HealthCardProps {
  health: HealthRating;
}

export default function HealthCard({ health }: HealthCardProps) {
  const rating = health.rating.toLowerCase();
  const isGood = rating.includes("good");
  const isCaution = rating.includes("caution");

  const config = isGood
    ? { icon: CheckCircle, color: "text-green-600", bg: "bg-green-500/10", text: "text-green-800 dark:text-green-300", sub: "text-green-700 dark:text-green-400" }
    : isCaution
    ? { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-500/10", text: "text-red-800 dark:text-red-300", sub: "text-red-700 dark:text-red-400" }
    : { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-500/10", text: "text-yellow-800 dark:text-yellow-300", sub: "text-yellow-700 dark:text-yellow-400" };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`p-4 rounded-lg flex items-start space-x-4 ${config.bg}`}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mt-1">
        <Icon className={`w-6 h-6 ${config.color}`} />
      </div>
      <div>
        <p className={`font-bold text-xl ${config.text}`}>{health.rating}</p>
        <p className={`text-sm ${config.sub}`}>{health.justification}</p>
      </div>
    </motion.div>
  );
}
