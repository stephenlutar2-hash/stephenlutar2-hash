import { useLocation } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">This dimension doesn't exist yet</p>
        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition"
        >
          <Home className="w-4 h-4" /> Return Home
        </button>
      </div>
    </div>
  );
}
