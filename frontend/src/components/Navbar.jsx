import { Link, NavLink } from "react-router-dom";
import { useData } from "../context/DataContext";

const Navbar = () => {
  const { profile } = useData();

  return (
    <header className="w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl sm:text-2xl md:text-[30px] font-bold text-primary tracking-tight flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl fill-icon">spa</span>
          <span>MindEase</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <NavLink
            to="/resources"
            className={({ isActive }) =>
              `relative pb-1 text-sm lg:text-base font-medium transition-all duration-200 ${
                isActive
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`
            }
          >
            Resources
          </NavLink>

          <NavLink
            to="/programs"
            className={({ isActive }) =>
              `relative pb-1 text-sm lg:text-base font-medium transition-all duration-200 ${
                isActive
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`
            }
          >
            Programs
          </NavLink>

          <NavLink
            to="/community"
            className={({ isActive }) =>
              `relative pb-1 text-sm lg:text-base font-medium transition-all duration-200 ${
                isActive
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`
            }
          >
            Community
          </NavLink>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          {profile?.name ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 font-semibold text-xs border border-amber-500/20">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                <span>{profile.streak} Day Streak</span>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container-high transition-all active:scale-95"
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-primary/20"
                />
                <span className="hidden sm:inline font-label-md text-on-surface font-semibold text-xs sm:text-sm">
                  {profile.name}
                </span>
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs sm:text-sm text-on-surface-variant hover:text-primary font-semibold px-2 py-1 transition-colors"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-primary hover:opacity-90 active:scale-95 text-white font-semibold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all duration-200 shadow-md shadow-primary/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;