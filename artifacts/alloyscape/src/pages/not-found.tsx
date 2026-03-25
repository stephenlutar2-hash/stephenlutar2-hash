import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black text-cyan-500/20">404</h1>
        <p className="text-gray-500">This route does not exist in AlloyScape.</p>
        <button onClick={() => setLocation("/")} className="text-cyan-400 hover:underline text-sm">Return to AlloyScape</button>
      </div>
    </div>
  );
}
