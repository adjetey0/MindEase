import { Link } from "react-router-dom";
import { FaGlobe, FaVolumeUp } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20 mt-8 transition-colors">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left */}
        <div>
          <h2 className="text-lg font-bold text-on-surface mb-2">
            MindEase
          </h2>

          <p className="text-on-surface-variant leading-6 text-sm w-full">
            Professional care for a modern world. Empowering your
            mental health journey with technology and empathy.
          </p>

          <p className="mt-3 text-error font-bold uppercase text-xs leading-5">
            Emergency: If you are in crisis, please contact emergency
            services or a suicide prevention hotline immediately.
          </p>
        </div>

        {/* Right Links */}
        <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-10">
          {/* Company */}
          <div>
            <h3 className="font-bold text-on-surface mb-2 text-sm">
              Company
            </h3>

            <ul className="space-y-2 text-on-surface-variant text-sm">
              <li>
                <Link to="/resources" className="hover:text-primary transition">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/programs" className="hover:text-primary transition">
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-primary transition">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-on-surface mb-2 text-sm">
              Legal
            </h3>

            <ul className="space-y-2 text-on-surface-variant text-sm">
              <li>
                <Link to="/privacy" className="hover:text-primary transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/clinical" className="hover:text-primary transition">
                  Clinical Resources
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-primary transition">
                  Emergency Help
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-8 py-2 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-on-surface-variant text-xs">
            © 2026 MindEase. Professional care for a modern world.
          </p>

          <div className="flex items-center gap-4 text-on-surface-variant text-base">
            <button className="hover:text-primary transition">
              <FaVolumeUp />
            </button>
            <button className="hover:text-primary transition">
              <IoLogoWhatsapp />
            </button>
            <button className="hover:text-primary transition">
              <FaGlobe />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;