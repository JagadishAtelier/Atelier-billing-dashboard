import { Mail, Lock, EyeClosed, Eye } from "lucide-react";
import loginIllustration from "/inventoryBg.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_API from "../api/api.js";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isMobileLogin, setIsMobileLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEW: store last response for visibility/debugging
  const [lastResponse, setLastResponse] = useState(null);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidMobile = (mobile) => /^\d{10}$/.test(mobile);

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

      const res = await axios.post(`${BASE_API}/user/login`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // save the raw response for debugging/display
      setLastResponse(res.data ?? res);

      const { message: responseMessage, token, refreshToken, user, role_name } = res.data;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", role_name)

        toast.success(
          ` ${responseMessage} - Welcome, ${user.username || user.name || ""}!`
        );

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed!";

      setLoginError(errorMessage);
      toast.error(errorMessage);

      // also store error response for visibility
      setLastResponse(error.response?.data ?? { error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white/90">
      {/* LEFT SECTION (Tablet & up) */}
      <div
        data-aos="fade-right"
        className="hidden md:flex lg:w-3/4 max-h-screen overflow-hidden items-center justify-center relative"
      >
        <img
          src={loginIllustration}
          alt="Medical Illustration"
          className="max-h-[96vh] min-h-[50vh] h-auto absolute bottom-0 left-0 object-contain"
        />
      </div>

      {/* RIGHT SECTION — slide-right */}
      <div
        data-aos="fade-left"
        className="flex w-full lg:w-1/4 max-h-screen h-screen items-center justify-center px-3 lg:px-8 lg:py-16 bg-white shadow-[-10px_0_20px_rgba(0,0,0,0.05)] aos-init aos-animate"
      >
        <div
          className="w-full max-w-md"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/inventory_logo.svg"
              alt="logo"
              className="h-24 aspect-square"
            />
          </div>

          {/* Title */}
          <h2
            data-aos="fade-up"
            className="text-center text-md font-bold mb-4"
          >
            Login into your account
          </h2>

          {/* Global Login Error */}
          {loginError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {loginError}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            {/* Email (current mode) */}
            {!isMobileLogin && (
              <div data-aos="fade-up" data-aos-delay="100">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className={`w-full bg-gray-100 rounded-lg border px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      emailError ? "border-red-500" : "border-gray-300"
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="bg-blue-600 h-full aspect-square rounded-md absolute right-0 top-0 flex items-center justify-center">
                    <Mail className="text-gray-100" size={20} />
                  </div>
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-red-500">{emailError}</p>
                )}
              </div>
            )}

            {/* You can enable this block when mobile login UI is needed */}
            {isMobileLogin && (
              <div data-aos="fade-up" data-aos-delay="100">
                <label htmlFor="mobile" className="text-sm font-medium">
                  Mobile Number
                </label>
                <div className="relative mt-1">
                  <input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    className={`w-full bg-gray-100 rounded-lg border px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      mobileError ? "border-red-500" : "border-gray-300"
                    }`}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <div className="bg-blue-600 h-full aspect-square rounded-md absolute right-0 top-0 flex items-center justify-center">
                    <Mail className="text-gray-100" size={20} />
                  </div>
                </div>
                {mobileError && (
                  <p className="mt-1 text-xs text-red-500">{mobileError}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div data-aos="fade-up" data-aos-delay="200">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-lg bg-gray-100 border px-4 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-[#1E2772] hover:text-[#1E2772]/80 transition-padding px-3"
                >
                  {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                </button>

                {/* Blue Lock Box */}
                <div className="bg-blue-600 h-full aspect-square rounded-md absolute right-0 top-0 flex items-center justify-center">
                  <Lock className="text-white" size={20} />
                </div>
              </div>

              {passwordError && (
                <p className="mt-1 text-xs text-red-500">{passwordError}</p>
              )}

              <div className="text-right mt-1">
                <a
                  href="#"
                  className="text-xs text-[#1E2772] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <button
              data-aos="fade-up"
              data-aos-delay="300"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-linear-to-r from-[#003893] to-[#005FF9] !text-white font-medium shadow-lg shadow-blue-200 transition-all duration-500 ease-in-out hover:bg-linear-to-l disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login Now"}
            </button>

            {/* Divider */}
            <div
              className="flex items-center gap-3 my-2"
              data-aos="fade-up"
              data-aos-delay="350"
            >
              <div className="grow border-t border-gray-300" />
              <span className="text-xs text-gray-600 font-bold">OR</span>
              <div className="grow border-t border-gray-300" />
            </div>

            {/* Signup Button */}
            <button
              type="button"
              className="w-full py-2.5 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
            >
              Signup Now
            </button>
          </form>

          {/* Optional: toggle between Email / Mobile login (UI hook ready) */}
          {/* 
          <div className="mt-4 text-center text-xs">
            <button
              type="button"
              onClick={() => {
                setIsMobileLogin((prev) => !prev);
                setEmailError("");
                setMobileError("");
              }}
              className="text-blue-600 hover:underline"
            >
              {isMobileLogin ? "Login with email instead" : "Login with mobile instead"}
            </button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default Login;
