import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="w-full bg-[#F8F9FC] border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-[36px] font-bold text-[#1565D8] tracking-tight"
        >
          MindEase
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-12">
          <NavLink
            to="/resources"
            className={({ isActive }) =>
              `relative pb-2 text-[17px] font-medium transition ${
                isActive
                  ? "text-[#1565D8]"
                  : "text-gray-600 hover:text-[#1565D8]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                Resources
                {isActive && (
                  <span className="absolute left-0 -bottom-[2px] h-[3px] w-full rounded-full bg-[#1565D8]" />
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/programs"
            className="text-[17px] font-medium text-gray-600 hover:text-[#1565D8] transition"
          >
            Programs
          </NavLink>

          <NavLink
            to="/community"
            className="text-[17px] font-medium text-gray-600 hover:text-[#1565D8] transition"
          >
            Community
          </NavLink>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-[17px] text-gray-700 hover:text-[#1565D8] font-medium"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="bg-[#1565D8] hover:bg-[#0F58C5] text-white font-semibold text-[16px] px-7 py-3 rounded-full transition duration-300 shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;