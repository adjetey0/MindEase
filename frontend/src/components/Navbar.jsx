import { NavLink } from "react-router-dom";

const Navbar = () => {
  const navLinks = [
    { name: "Programs", path: "/programs", icon: "apps" },
    { name: "Community", path: "/community", icon: "group" },
    { name: "Resources", path: "/resources", icon: "menu_book" },
  ];

  return (
    <div className="w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 h-12 overflow-x-auto scrollbar-none">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined text-base shrink-0"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Navbar;