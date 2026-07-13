import { Link } from "react-router-dom";
import { FaGlobe, FaVolumeUp } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="bg-[#EEF2FF] border-t border-gray-200 mt-20">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-16">
        {/* Left */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            MindEase
          </h2>

          <p className="text-gray-600 leading-8 text-lg max-w-md">
            Professional care for a modern world. Empowering your
            mental health journey with technology and empathy.
          </p>

          <p className="mt-8 text-red-600 font-bold uppercase text-sm leading-6">
            Emergency: If you are in crisis, please contact emergency
            services or a suicide prevention hotline immediately.
          </p>
        </div>

        {/* Right Links */}
        <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-20">
          {/* Company */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">
              Company
            </h3>

            <ul className="space-y-5 text-gray-600">
              <li>
                <Link
                  to="/resources"
                  className="hover:text-blue-600 transition"
                >
                  Resources
                </Link>
              </li>

              <li>
                <Link
                  to="/programs"
                  className="hover:text-blue-600 transition"
                >
                  Programs
                </Link>
              </li>

              <li>
                <Link
                  to="/community"
                  className="hover:text-blue-600 transition"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">
              Legal
            </h3>

            <ul className="space-y-5 text-gray-600">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-blue-600 transition"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/terms"
                  className="hover:text-blue-600 transition"
                >
                  Terms of Service
                </Link>
              </li>

              <li>
                <Link
                  to="/clinical"
                  className="hover:text-blue-600 transition"
                >
                  Clinical Resources
                </Link>
              </li>

              <li>
                <Link
                  to="/emergency"
                  className="hover:text-blue-600 transition"
                >
                  Emergency Help
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-base">
            © 2024 MindEase. Professional care for a modern world.
          </p>

          <div className="flex items-center gap-6 text-gray-600 text-xl">
            <button className="hover:text-blue-600 transition">
              <FaVolumeUp />
            </button>

            <button className="hover:text-blue-600 transition">
              <IoLogoWhatsapp />
            </button>

            <button className="hover:text-blue-600 transition">
              <FaGlobe />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;