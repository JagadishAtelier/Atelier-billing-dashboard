import { Mail, Lock, EyeClosed, Eye } from "lucide-react";
import loginIllustration from "/inventoryBg.svg";
import { useState } from "react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen w-full flex">
      {/* LEFT SECTION */}
      <div
        data-aos="fade-right"
        className="hidden max-h-screen overflow-hidden lg:flex w-3/4 items-center justify-center bg-white/80"
      >
        <img
          src={loginIllustration}
          alt="Medical Illustration"
          className="max-h-screen h-[98vh] absolute bottom-0 left-0 object-contain"
        />
      </div>

      {/* RIGHT SECTION — slide-right */}
      <div
        data-aos="fade-left"
        className="flex w-full lg:w-1/4 max-h-screen h-screen items-center justify-center px-3 lg:px-8 lg:py-16 bg-white shadow-[-10px_0_20px_rgba(0,0,0,0.05)]"
      >
        <div
          className="w-full max-w-md"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/inventory_logo.svg" alt="logo" className="h-24 aspect-square" />
          </div>

          {/* Title */}
          <h2 data-aos="fade-up" className="text-center text-md font-bold mb-6">
            Login into your account
          </h2>

          {/* Form */}
          <form className="space-y-4">
            {/* Email */}
            <div data-aos="fade-up" data-aos-delay="100">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  placeholder="alex@email.com"
                  className="w-full bg-gray-100 rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="bg-blue-600 h-full aspect-square rounded-md absolute right-0 top-0 flex items-center justify-center">
                  <Mail
                    className="text-gray-100"
                    size={20}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div data-aos="fade-up" data-aos-delay="200">
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-lg bg-gray-100 border border-gray-300 px-4 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Eye Icon (left inside the input) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-[#1E2772] hover:text-[#1E2772]/80 transition-padding px-3"
                >
                  {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                </button>

                {/* Blue Lock Box (unchanged) */}
                <div className="bg-blue-600 h-full aspect-square rounded-md absolute right-0 top-0 flex items-center justify-center">
                  <Lock className="text-white" size={20} />
                </div>
              </div>

              <div className="text-right mt-1">
                <a href="#" className="text-xs text-[#1E2772] hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <button
              data-aos="fade-up"
              data-aos-delay="300"
              type="submit"
              className="w-full py-2.5 rounded-lg bg-linear-to-r from-[#003893] to-[#005FF9] text-white font-medium  shadow-lg shadow-blue-200 transition-all duration-500 ease-in-out hover:bg-linear-to-l"
            >
              Login Now
            </button>

            {/* Divider */}
            <div
              className="flex items-center gap-3"
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
        </div>
      </div>
    </div>
  );
};

export default Login;