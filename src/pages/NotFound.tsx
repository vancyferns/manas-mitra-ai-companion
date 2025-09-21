
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-pink-50 to-green-50 relative">
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-64 opacity-30" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#a5b4fc" fillOpacity="0.18" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,154.7C672,160,768,192,864,197.3C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      <div className="relative z-10 text-center bg-white/90 rounded-3xl shadow-xl border border-slate-200 px-8 py-12 max-w-md mx-auto">
        <img src="/favicon.ico" alt="Manas Mitra Logo" className="w-14 h-14 mx-auto mb-4 rounded-full shadow" />
        <h1 className="mb-2 text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-400 to-green-400">404</h1>
        <p className="mb-4 text-xl font-semibold text-slate-700">Oops! Page not found</p>
        <p className="mb-6 text-slate-500">The page you’re looking for doesn’t exist or has been moved.<br/>Let’s get you back to a safe space.</p>
        <a href="/" className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-blue-400 via-pink-300 to-green-300 text-white font-bold shadow-lg hover:scale-105 transition-transform">Return to Home</a>
      </div>
    </div>
  );
};

export default NotFound;
