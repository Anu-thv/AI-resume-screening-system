import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiLogIn, FiUserPlus, FiBriefcase, FiEye, FiEyeOff } from "react-icons/fi";

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("candidate");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const apiRole = role === "hr" ? "recruiter" : "candidate";
    const username = (role === "hr" ? "r_" : "c_") + email;

    try {
      if (isLogin) {
        const response = await fetch("/api/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role: apiRole })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem("userRole", role);
          localStorage.setItem("userEmail", email);
          navigate(role === "hr" ? "/hr-dashboard" : "/candidate-dashboard");
        } else {
          setErrorMsg(data.error || "Invalid email or password");
        }
      } else {
        const response = await fetch("/api/signup/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert("Account Created Successfully! Please log in.");
          setIsLogin(true);
          setPassword("");
        } else {
          setErrorMsg(data.error || "Failed to create account");
        }
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="card p-8 shadow-2xl relative overflow-hidden">
          
          {/* Top Toggles (Login vs Create Account) */}
          <div className="flex bg-black/40 rounded-xl p-1 mb-8 border border-white/5">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                isLogin ? "bg-white/10 text-cyan-400 shadow-md shadow-white/5" : "text-slate-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                !isLogin ? "bg-white/10 text-purple-400 shadow-md shadow-white/5" : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="text-center mb-6 block">
            <h1 className={`text-4xl font-extrabold mb-2 bg-gradient-to-r bg-clip-text text-transparent flex justify-center items-center gap-3 ${isLogin ? 'from-cyan-400 to-blue-500' : 'from-purple-400 to-pink-500'}`}>
              {isLogin ? "Welcome Back" : "Join HireSense"}
            </h1>
            <p className="text-slate-400">{isLogin ? "Login to access your dashboard" : "Instantly jumpstart your journey."}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
                {errorMsg}
              </div>
            )}

            
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="space-y-2 mb-4"
                >
                  <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type="text"
                      className="w-full h-12 rounded-xl pl-12 pr-4 bg-black/50 border border-white/10 text-white outline-none focus:border-purple-400 transition-colors"
                      placeholder="John Doe"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="email"
                  className={`w-full h-12 rounded-xl pl-12 pr-4 bg-black/50 border border-white/10 text-white outline-none transition-colors ${isLogin ? 'focus:border-cyan-400' : 'focus:border-purple-400'}`}
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full h-12 rounded-xl pl-12 pr-12 bg-black/50 border border-white/10 text-white outline-none transition-colors ${isLogin ? 'focus:border-cyan-400' : 'focus:border-purple-400'}`}
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
            </div>
            
            <div className="pt-2">
              <label className="text-sm font-medium text-slate-300 ml-1 mb-2 block">Continuing as a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    role === "candidate"
                      ? "bg-cyan-500/20 border-cyan-400 text-white"
                      : "bg-black/50 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <FiUser /> Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole("hr")}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    role === "hr"
                      ? "bg-cyan-500/20 border-cyan-400 text-white"
                      : "bg-black/50 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <FiBriefcase /> Recruiter
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2 mt-6 transition-all
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              ${isLogin 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                : 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              }`}
            >
              {isLoading ? (
                <span>Please wait...</span>
              ) : isLogin ? (
                <><FiLogIn /> Login</>
              ) : (
                <><FiUserPlus /> Create Account</>
              )}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}

export default Login;
