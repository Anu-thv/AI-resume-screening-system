import { Link, useNavigate } from "react-router-dom";
import { FiGithub } from "react-icons/fi";
function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  const handleDashboard = () => {
    if (role === "candidate") {
      navigate("/candidate-dashboard");
    } else if (role === "hr") {
      navigate("/hr-dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src="/hiresense_logo.png"
            alt="HireSense Logo"
            className="w-8 h-8 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-shadow duration-300"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            HireSense
          </h1>
        </div>

        {/* NAV LINKS */}
        <div className="flex gap-6 items-center text-white">
          <Link to="/" className="hover:text-cyan-400 transition">
            Home
          </Link>

          <Link to="/about" className="hover:text-cyan-400 transition">
            About
          </Link>

          {role === "hr" && (
            <Link to="/screener" className="hover:text-cyan-400 transition text-cyan-200 font-semibold">
              AI Screener Tool
            </Link>
          )}

          <a 
            href="https://github.com/Anu-thv/AI-resume-screening-system" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-cyan-400 transition"
          >
            <FiGithub />
            GitHub
          </a>

          {role ? (
            <>
              <button
                onClick={handleDashboard}
                className="hover:text-cyan-400 transition"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition hover:text-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;