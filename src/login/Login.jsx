import React, { useState } from 'react';
import { Package, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import BASE_API from "../api/api.js";
import { useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import axios from "axios";
import loginmain from "../components/assets/loginmain.png"
import logo from "../components/assets/Company_logo.png";

export default function Login({ onLogin = () => {}, onNavigate = () => {} }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isMobileLogin, setIsMobileLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEW: store last response for visibility/debugging
  const [lastResponse, setLastResponse] = useState(null);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidMobile = (mobile) =>
    /^\d{10}$/.test(mobile);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailError("");
    setMobileError("");
    setPasswordError("");
    setLoginError("");

    let hasError = false;

    // email / mobile validation
    if (isMobileLogin) {
      if (!mobile.trim()) {
        setMobileError("Mobile number is required");
        hasError = true;
      } else if (!isValidMobile(mobile)) {
        setMobileError("Please enter a valid 10-digit mobile number");
        hasError = true;
      }
    } else {
      if (!email.trim()) {
        setEmailError("Email is required");
        hasError = true;
      } else if (!isValidEmail(email)) {
        setEmailError("Please enter a valid email address");
        hasError = true;
      }
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    setLastResponse(null); // clear previous response

    try {
      const payload = {
        identifier: isMobileLogin ? mobile : email,
        password,
      };

      const res = await axios.post(
        `${BASE_API}/user/login`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // save the raw response for debugging/display
      setLastResponse(res.data ?? res);

      const {
        message: responseMessage,
        token,
        refreshToken,
        user,
      } = res.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        message.success(`${responseMessage} 🎉 Welcome, ${user.username || user.name || ''}!`);

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed!";

      setLoginError(errorMessage);
      message.error(errorMessage);

      // also store error response for visibility
      setLastResponse(error.response?.data ?? { error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center ">
      {/* Changed breakpoint to md so tablets show 2-column layout like desktop */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center">
        {/* Left Side - Branding (now visible on md and up) */}
        <motion.div
  initial={{ opacity: 0, x: -40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5 }}
  className="hidden md:flex h-full w-full"
>
  <div className="flex items-center l-[200px]">
    <img
    src={loginmain}
    alt="Login illustration"
    className="w-[600px] md:w-full flex  h-[648px] object-cover rounded-l-3xl"
  />
  </div>
  
</motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="bg-white mr-6 rounded-3xl shadow-2xl p-6 md:p-12">
            <div className="text-center mb-6">
              <div className="md:hidden flex items-center justify-center gap-3 mb-1">
                <img src={logo} alt="Company logo" className="h-24 object-contain" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Welcome back!</h2>
              <p className="text-sm text-gray-600 mt-2">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Toggle: Email vs Mobile login (so mobile state and isMobileLogin have UI) */}
              {/* <div className="flex items-center justify-center gap-2"> */}
                {/* <button
                  type="button"
                  onClick={() => setIsMobileLogin(false)}
                  className={`px-4 py-1 rounded-full text-sm font-medium ${!isMobileLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileLogin(true)}
                  className={`px-4 py-1 rounded-full text-sm font-medium ${isMobileLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Mobile
                </button> */}
              {/* </div> */}

              {/* Conditionally render Email or Mobile input */}
              {!isMobileLogin ? (
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-11 pr-4 h-12 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      className="pl-11 pr-4 h-12 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      required
                      maxLength={10}
                    />
                  </div>
                  {mobileError && <p className="text-xs text-red-600 mt-1">{mobileError}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-12 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember me</label>
                </div>
                <div>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-blue-600 hover:underline">Forgot password?</button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 !text-white font-semibold rounded-lg shadow-md disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Spin size="small" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
              </div>
            </form>

            {/* show server response (for debugging / visibility) */}
            {/* Uncomment if you want to display raw response */}
            {/* {lastResponse && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100">
                <div className="text-sm font-medium text-gray-700 mb-2">Last response</div>
                <pre className="text-xs text-gray-700 max-h-48 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
              </div>
            )} */}

            {loginError && <div className="mt-3 text-sm text-red-600">{loginError}</div>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-gray-900 font-semibold">{title}</h3>
        <p className="text-gray-600 mt-1 text-sm">{desc}</p>
      </div>
    </div>
  );
}
