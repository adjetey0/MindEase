import Navbar from "../components/Navbar";
import { FaArrowRight } from "react-icons/fa";

const LandingPage = () => {

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-[#F8F9FC]">
        <div className="max-w-7xl mx-auto px-6">

          {/* Hero Content */}
          <div className="flex flex-col items-center text-center pt-24">

            {/* Badge */}
            <div className="px-5 py-2 rounded-full bg-blue-100 text-[#1565D8] text-sm font-medium">
              ✨ AI-Powered Mental Health Support
            </div>

            {/* Heading */}
            <h1 className="mt-8 text-6xl font-bold text-[#111827] leading-tight max-w-4xl">
              Your Mental Wellness Companion
            </h1>

            {/* Description */}
            <p className="mt-6 text-gray-600 text-xl max-w-3xl leading-9">
              Manage stress, anxiety, and daily challenges with the help of
              clinically-informed AI. Gentle guidance designed for your
              emotional well-being.
            </p>

            {/* Buttons */}
            <div className="mt-12 flex gap-6">
              <button className="flex items-center gap-3 bg-[#1565D8] hover:bg-blue-700 transition text-white px-8 py-4 rounded-full font-semibold shadow-lg">
                Start Chatting
                <FaArrowRight size={13} />
              </button>

              <button className="border-2 border-[#1565D8] text-[#1565D8] hover:bg-[#1565D8] hover:text-white transition px-8 py-4 rounded-full font-semibold">
                Learn More
              </button>
            </div>

            {/* Hero Image */}
            <div className="mt-20 w-full flex justify-center">
              <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/hero-image.png"
                  alt="MindEase Hero"
                  className="w-full h-[520px] object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;