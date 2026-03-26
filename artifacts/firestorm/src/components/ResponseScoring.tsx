import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, Play, RotateCcw, Trophy } from "lucide-react";

interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  expectedTime: number;
  points: number;
}

const playbookSteps: PlaybookStep[] = [
  { id: "s1", title: "Initial Triage", description: "Classify the alert severity and identify affected systems", expectedTime: 60, points: 20 },
  { id: "s2", title: "Evidence Collection", description: "Gather logs, network captures, and endpoint telemetry", expectedTime: 120, points: 25 },
  { id: "s3", title: "Scope Assessment", description: "Determine the blast radius and lateral movement indicators", expectedTime: 90, points: 20 },
  { id: "s4", title: "Containment Action", description: "Isolate affected hosts and block malicious IPs/domains", expectedTime: 45, points: 20 },
  { id: "s5", title: "Stakeholder Notification", description: "Brief SOC lead and document in incident timeline", expectedTime: 30, points: 15 },
];

export default function ResponseScoring() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [stepTimes, setStepTimes] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  function startDrill() {
    setIsRunning(true);
    setCurrentStep(0);
    setElapsed(0);
    setStepTimes([]);
    setCompleted(false);
  }

  function completeStep() {
    const newTimes = [...stepTimes, elapsed];
    setStepTimes(newTimes);
    if (currentStep + 1 >= playbookSteps.length) {
      setIsRunning(false);
      setCompleted(true);
    } else {
      setCurrentStep(currentStep + 1);
      setElapsed(0);
    }
  }

  function reset() {
    setIsRunning(false);
    setCurrentStep(0);
    setElapsed(0);
    setStepTimes([]);
    setCompleted(false);
  }

  function getStepScore(step: PlaybookStep, time: number): number {
    if (time <= step.expectedTime) return step.points;
    const overRatio = time / step.expectedTime;
    return Math.max(0, Math.round(step.points * (2 - overRatio)));
  }

  const totalScore = completed ? stepTimes.reduce((acc, time, i) => acc + getStepScore(playbookSteps[i], time), 0) : 0;
  const maxScore = playbookSteps.reduce((a, s) => a + s.points, 0);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white tracking-wide uppercase">
              Response Trainer
            </h3>
            <p className="text-xs text-gray-500 mt-1">Timed playbook drill — beat the clock for maximum score</p>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning && !completed && (
              <button onClick={startDrill} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/30 transition">
                <Play className="w-3 h-3" /> Start Drill
              </button>
            )}
            {(isRunning || completed) && (
              <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 text-xs font-bold flex items-center gap-1 hover:bg-white/10 transition">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-lg font-display font-bold text-white">Drill Complete!</p>
                <p className="text-xs text-gray-400">Total time: {formatTime(stepTimes.reduce((a, b) => a + b, 0))}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-display font-bold ${totalScore >= maxScore * 0.8 ? "text-emerald-400" : totalScore >= maxScore * 0.5 ? "text-amber-400" : "text-red-400"}`}>
                {totalScore}/{maxScore}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Score</p>
            </div>
          </motion.div>
        )}

        {isRunning && (
          <div className="mb-5 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="text-sm font-bold text-orange-400">Step {currentStep + 1}: {playbookSteps[currentStep].title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-mono font-bold ${elapsed > playbookSteps[currentStep].expectedTime ? "text-red-400" : "text-emerald-400"}`}>
                {formatTime(elapsed)}
              </span>
              <span className="text-[10px] text-gray-500">/ {formatTime(playbookSteps[currentStep].expectedTime)}</span>
              <button onClick={completeStep} className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition">
                Complete ✓
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {playbookSteps.map((step, i) => {
            const isDone = i < stepTimes.length;
            const isCurrent = isRunning && i === currentStep;
            const time = isDone ? stepTimes[i] : 0;
            const score = isDone ? getStepScore(step, time) : 0;
            const onTime = isDone && time <= step.expectedTime;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isCurrent ? "border-orange-500/30 bg-orange-500/[0.05]" :
                  isDone ? "border-white/10 bg-white/[0.02]" :
                  "border-white/5 bg-white/[0.01]"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isDone ? (onTime ? "bg-emerald-500/20" : "bg-amber-500/20") :
                  isCurrent ? "bg-orange-500/20" : "bg-white/5"
                }`}>
                  {isDone ? (
                    onTime ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span className={`text-xs font-bold ${isCurrent ? "text-orange-400" : "text-gray-600"}`}>{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCurrent ? "text-orange-400" : isDone ? "text-white" : "text-gray-500"}`}>{step.title}</p>
                  <p className="text-[10px] text-gray-500 truncate">{step.description}</p>
                </div>
                <div className="text-right shrink-0">
                  {isDone ? (
                    <>
                      <p className={`text-xs font-mono font-bold ${onTime ? "text-emerald-400" : "text-amber-400"}`}>{formatTime(time)}</p>
                      <p className="text-[9px] text-gray-500">{score}/{step.points} pts</p>
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-600 font-mono">Target: {formatTime(step.expectedTime)}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
