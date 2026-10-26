import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Street Cleaning",
    description:
      "Keeping our streets clean and safe for a healthier community.",
    image: "/imgs/photo_2026-04-27_04-23-21-removebg-preview.png",
  },
  {
    title: "Awareness Campaigns",
    description:
      "Helping citizens learn how to keep their environment clean.",
    image: "/imgs/photo_2026-04-27_04-23-03-removebg-preview.png",
  },
  {
    title: "Report Garbage",
    description:
      "Users can report trash locations easily through the platform.",
    image:
      "/imgs/photo_2026-04-27_04-22-42-removebg-preview%20(1).png",
  },
];

const statistics = [
  { number: "120K+", label: "Happy Citizens" },
  { number: "25K+", label: "Reports Submitted" },
  { number: "300+", label: "Clean Areas" },
  { number: "10K+", label: "Active Users" },
];

// Reveal elements when they enter the screen
function useScrollReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          } else {
            entry.target.classList.remove("reveal-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    elements.forEach((element, index) => {
      element.style.transitionDelay = `${(index % 4) * 120}ms`;
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return containerRef;
}

function Home() {
  const containerRef = useScrollReveal();

  const [contact, setContact] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  function handleContactSubmit(event) {
    event.preventDefault();

    if (
      !contact.name.trim() ||
      !contact.email.trim() ||
      !contact.message.trim()
    ) {
      return;
    }

    setSent(true);
    setContact({ name: "", email: "", message: "" });
  }

  return (
    <div
      ref={containerRef}
      className="home-page bg-white text-gray-800 transition-colors duration-500 dark:bg-gray-900 dark:text-white"
    >
      {/* Scroll Animation Styles */}
      <style>{`
        .home-page .reveal {
          opacity: 0;
          transform: translateY(35px);
          transition:
            opacity 650ms ease,
            transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }

        .home-page .reveal.reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .home-page .reveal-left {
          transform: translateX(-35px);
        }

        .home-page .reveal-right {
          transform: translateX(35px);
        }

        .home-page .reveal-left.reveal-visible,
        .home-page .reveal-right.reveal-visible {
          transform: translateX(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .home-page .reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

      {/* Home / Hero */}
      <section id="home" className="py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:grid-cols-2 md:gap-12">
          <div className="reveal reveal-left">
            <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-green-600">
              Welcome:
            </h4>

            <h1 className="mb-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              A Cleaner City{" "}
              <span className="text-green-500">
                For A Better Life
              </span>
            </h1>

            <p className="mb-6 text-lg leading-relaxed text-gray-500 dark:text-gray-400">
              We provide integrated waste management and recycling
              solutions to protect our environment.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#contact"
                className="rounded-3xl bg-green-700 px-8 py-3 text-center font-bold text-white shadow-lg transition hover:scale-105 hover:bg-green-800"
              >
                Contact Us
              </a>

              <a
                href="#Services"
                className="rounded-3xl border-2 border-green-600 px-6 py-3 text-center font-bold text-green-600 transition hover:bg-green-600 hover:text-white"
              >
                Our Services
              </a>
            </div>
          </div>

          <div className="reveal reveal-right flex items-center justify-center">
            <img
              src="/imgs/ChatGPT_Image_27_%D8%A3%D8%A8%D8%B1%D9%8A%D9%84_2026__02_01_32_%D8%B5-removebg-preview.png"
              alt="EcoPulse environmental protection"
              className="h-auto max-h-[400px] w-full rounded-[2.5rem] object-contain md:object-cover"
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        className="bg-gray-50 py-20 dark:bg-gray-800/50"
        id="Services"
      >
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="reveal mb-3 text-center text-3xl font-extrabold sm:text-4xl">
            Our <span className="text-green-600">Services</span>
          </h2>

          <p className="reveal mx-auto mb-14 max-w-2xl text-center text-gray-500 dark:text-gray-300">
            We offer a range of services to keep our city clean,
            green and beautiful.
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={service.title}
                style={{ transitionDelay: `${index * 160}ms` }}
                className="reveal group rounded-3xl bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-gray-900"
              >
                <div className="mb-5 flex h-28 items-center justify-center">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    className="h-24 max-w-full object-contain transition group-hover:scale-110"
                  />
                </div>

                <h3 className="mb-2 text-xl font-bold">
                  {service.title}
                </h3>

                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {service.description}
                </p>

                {service.title === "Awareness Campaigns" && (
                  <Link
                    to="/awareness"
                    className="mt-5 inline-block font-semibold text-green-600 hover:text-green-700"
                  >
                    Learn More
                  </Link>
                )}

                {service.title === "Report Garbage" && (
                  <Link
                    to="/report"
                    className="mt-5 inline-block font-semibold text-green-600 hover:text-green-700"
                  >
                    Report Now
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:grid-cols-2 md:gap-12">
          <div className="reveal reveal-left">
            <h4 className="mb-2 text-sm font-bold uppercase tracking-widest text-green-600">
              Our Mission
            </h4>

            <h2 className="mb-4 text-3xl font-black leading-tight sm:text-4xl">
              Smart Solutions{" "}
              <span className="text-green-500">
                For A Cleaner City
              </span>
            </h2>

            <p className="mb-6 text-lg leading-relaxed text-gray-500 dark:text-gray-400">
              We use technology to help citizens report waste and
              improve city cleanliness for a healthier and better
              tomorrow.
            </p>

            <Link
              to="/report"
              className="inline-block rounded-3xl bg-green-700 px-8 py-3 font-bold text-white shadow-lg transition hover:scale-105 hover:bg-green-800"
            >
              Discover More
            </Link>
          </div>

          <div className="reveal reveal-right flex items-center justify-center">
            <img
              src="/imgs/photo_2026-04-27_04-23-12-removebg-preview.png"
              alt="Smart environmental solutions"
              loading="lazy"
              className="h-auto max-h-[400px] w-full rounded-[2.5rem] object-contain md:object-cover"
            />
          </div>
        </div>
      </section>

      {/* Gallery Statistics */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <h2 className="reveal text-3xl font-bold">
            Our <span className="text-green-600">Gallery</span>
          </h2>

          <p className="reveal mb-10 mt-2 text-gray-500 dark:text-gray-300">
            Together, we make a difference.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-8 md:grid-cols-4">
            {statistics.map((item, index) => (
              <div
                key={item.label}
                style={{ transitionDelay: `${index * 140}ms` }}
                className="reveal"
              >
                <h3 className="text-2xl font-bold text-green-500">
                  {item.number}
                </h3>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        className="bg-white py-20 dark:bg-gray-900 md:py-24"
        id="contact"
      >
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <div className="reveal reveal-left">
              <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">
                Contact <span className="text-green-500">Us</span>
              </h2>

              <p className="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
                We’d love to hear from you. Reach out to us for any
                inquiries or support.
              </p>

              <div className="space-y-5 text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <i
                    className="fa-solid fa-phone text-green-500"
                    aria-hidden="true"
                  />
                  <p>+1 (123) 456-7890</p>
                </div>

                <div className="flex items-center gap-3">
                  <i
                    className="fa-solid fa-envelope-circle-check text-green-500"
                    aria-hidden="true"
                  />
                  <p>info@cleanCity.com</p>
                </div>

                <div className="flex items-center gap-3">
                  <i
                    className="fa-solid fa-location-dot text-green-500"
                    aria-hidden="true"
                  />
                  <p>123 Clean Street, Green City</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="reveal reveal-right space-y-5 rounded-3xl bg-gray-50 p-6 shadow-xl sm:p-10 dark:bg-gray-800"
            >
              <input
                type="text"
                placeholder="Your Name"
                aria-label="Your Name"
                value={contact.name}
                onChange={(event) => {
                  setContact({ ...contact, name: event.target.value });
                  setSent(false);
                }}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900"
              />

              <input
                type="email"
                placeholder="Your Email"
                aria-label="Your Email"
                value={contact.email}
                onChange={(event) => {
                  setContact({ ...contact, email: event.target.value });
                  setSent(false);
                }}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900"
              />

              <textarea
                placeholder="Your Message"
                aria-label="Your Message"
                value={contact.message}
                onChange={(event) => {
                  setContact({ ...contact, message: event.target.value });
                  setSent(false);
                }}
                required
                rows={5}
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-5 py-4 outline-none transition focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900"
              />

              <button
                type="submit"
                className="w-full rounded-xl bg-green-600 py-4 font-bold text-white shadow-lg transition hover:bg-green-700 active:scale-[0.98]"
              >
                Send Message
              </button>

              {sent && (
                <p
                  role="status"
                  className="text-center font-medium text-green-600"
                >
                  Your message is ready, but sending it requires a backend.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
