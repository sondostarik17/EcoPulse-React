
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaRecycle,
  FaTrashCan,
  FaLeaf,
  FaBan,
  FaBottleWater,
  FaBolt,
  FaHeartPulse,
  FaArrowRight,
  FaLocationDot,
  FaCheck,
  FaGlobe,
  FaSeedling,
} from "react-icons/fa6";

const tips = [
  {
    icon: FaRecycle,
    title: "Recycle Waste",
    description:
      "Reuse plastic and paper to reduce pollution and give materials a second life.",
  },
  {
    icon: FaTrashCan,
    title: "Use Trash Bins",
    description:
      "Dispose of garbage in the right bins to keep streets clean and safe.",
  },
  {
    icon: FaLeaf,
    title: "Protect Nature",
    description:
      "Keep green spaces clean and protect the environment for future generations.",
  },
  {
    icon: FaBan,
    title: "Reduce Plastic",
    description:
      "Choose reusable products and avoid unnecessary single-use plastics.",
  },
];

const facts = [
  {
    icon: FaBottleWater,
    title: "Up to 450 Years",
    description:
      "Some plastic bottles can take hundreds of years to break down in the environment.",
  },
  {
    icon: FaBolt,
    title: "Save Energy",
    description:
      "Recycling many materials helps save energy and conserve natural resources.",
  },
  {
    icon: FaHeartPulse,
    title: "Healthier Cities",
    description:
      "Cleaner public spaces can help reduce pollution and support healthier communities.",
  },
];

const benefits = [
  "Cleaner streets and public spaces",
  "Less waste in the environment",
  "A healthier community for everyone",
];

function SectionHeading({ eyebrow, title, highlight, description }) {
  return (
    <div
      data-reveal
      className="mx-auto mb-12 max-w-2xl text-center sm:mb-14"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-green-600 sm:text-sm">
        {eyebrow}
      </p>

      <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-white sm:text-4xl lg:text-5xl">
        {title}{" "}
        <span className="text-green-600 dark:text-green-400">
          {highlight}
        </span>
      </h2>

      {description && (
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

function Awareness() {
  // Reveal each element the first time it enters the viewport.
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("reveal-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    elements.forEach((element, index) => {
      element.classList.add("reveal-item");

      // Stagger nearby elements without making later sections too slow.
      element.style.setProperty(
        "--reveal-delay",
        `${(index % 5) * 85}ms`
      );

      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-gray-800 dark:bg-gray-900 dark:text-white">
      {/* Scroll reveal animation styles */}
      <style>{`
        .reveal-item {
          opacity: 0;
          transform: translate3d(0, 28px, 0);
          transition:
            opacity 700ms ease,
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--reveal-delay, 0ms);
          will-change: opacity, transform;
        }

        .reveal-item.reveal-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-item,
          .reveal-item.reveal-visible {
            opacity: 1;
            transform: none;
            transition: none;
            transition-delay: 0ms;
            will-change: auto;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden border-b border-gray-100 bg-green-50 dark:border-gray-700 dark:bg-gray-800">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-green-200/50 blur-[100px]" />
          <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-green-300/30 blur-[110px]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-2 md:gap-10 lg:px-10 lg:py-28">
          <div
            data-reveal
            className="relative z-10 text-center md:text-left"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-green-700 dark:border-green-800 dark:bg-gray-900/70 dark:text-green-400 sm:text-sm">
              <FaGlobe aria-hidden="true" />
              EcoPulse Awareness
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              Small Actions.
              <span className="mt-2 block text-green-600 dark:text-green-400">
                Cleaner Future.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg md:mx-0">
              Every clean street starts with a small step. Discover
              simple ways to reduce waste, protect nature, and make
              our communities better places to live.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
              <a
                href="#awareness-tips"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-green-700 px-7 py-3.5 font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Explore Tips
                <FaArrowRight aria-hidden="true" />
              </a>

              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-green-200 bg-white px-7 py-3.5 font-bold text-green-800 transition duration-300 hover:border-green-400 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 dark:border-gray-600 dark:bg-gray-900 dark:text-green-400 dark:hover:bg-gray-800"
              >
                Report Waste
                <FaLocationDot aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-gray-300 md:justify-start">
              <span className="inline-flex items-center gap-2">
                <FaCheck
                  className="text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
                Simple daily habits
              </span>

              <span className="inline-flex items-center gap-2">
                <FaCheck
                  className="text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
                Real community impact
              </span>
            </div>
          </div>

          <div
            data-reveal
            className="relative mx-auto w-full max-w-xl"
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-green-200/60 blur-2xl dark:bg-green-700/20" />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-green-100 bg-white p-2 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
              <img
                src="/imgs/photo_2026-05-13_05-24-09.jpg"
                alt="Keeping the environment clean"
                className="h-72 w-full rounded-2xl object-cover sm:h-96 lg:h-[440px]"
              />

              <div className="absolute inset-x-2 bottom-2 rounded-b-2xl bg-gradient-to-t from-black/90 via-black/55 to-transparent p-6 pt-16 sm:p-8 sm:pt-20">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-300">
                      Our Mission
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                      A Cleaner World Starts With Us
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xl text-green-300 backdrop-blur-md">
                    <FaSeedling aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-2 top-8 hidden items-center gap-3 rounded-xl border border-green-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-800 sm:flex lg:-right-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-lg text-green-700 dark:bg-green-900/50 dark:text-green-400">
                <FaLeaf aria-hidden="true" />
              </span>

              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  Make a Difference
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  One action at a time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awareness Tips */}
      <section
        id="awareness-tips"
        className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Better Habits, Better Planet"
            title="Awareness"
            highlight="Tips"
            description="Small changes in our daily lives can make a meaningful difference to the places we share."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tips.map((tip, index) => {
              const Icon = tip.icon;

              return (
                <article
                  key={tip.title}
                  data-reveal
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition duration-300 hover:-translate-y-2 hover:border-green-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-7"
                >
                  <span className="absolute right-5 top-5 text-xs font-bold tracking-widest text-gray-400 dark:text-gray-500">
                    0{index + 1}
                  </span>

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl text-green-700 transition duration-300 group-hover:bg-green-700 group-hover:text-white dark:bg-green-900/40 dark:text-green-400">
                    <Icon aria-hidden="true" />
                  </div>

                  <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-white">
                    {tip.title}
                  </h3>

                  <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                    {tip.description}
                  </p>

                  <div className="mt-6 h-1 w-10 rounded-full bg-green-300 transition-all duration-300 group-hover:w-16 group-hover:bg-green-600 dark:bg-green-700" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before & After */}
      <section className="border-y border-gray-100 bg-gray-50 px-5 py-16 dark:border-gray-700 dark:bg-gray-800/60 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="From Problem to Progress"
            title="Before"
            highlight="& After"
            description="Cleaner streets begin with responsible waste disposal and taking action when public spaces need attention."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <article
              data-reveal
              className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="relative overflow-hidden">
                <img
                  src="/imgs/photo_2026-05-13_05-19-50.jpg"
                  alt="Public area before cleaning"
                  loading="lazy"
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-80"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                <span className="absolute left-5 top-5 rounded-full bg-gray-900/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  Before
                </span>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  The Problem
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
                  Waste left in public places can make streets less
                  pleasant and may affect the cleanliness and safety
                  of our surroundings.
                </p>
              </div>
            </article>

            <article
              data-reveal
              className="group overflow-hidden rounded-3xl border border-green-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="relative overflow-hidden">
                <img
                  src="/imgs/photo_2026-05-14_00-37-45.jpg"
                  alt="Clean public area after waste removal"
                  loading="lazy"
                  className="h-64 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-80"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                <span className="absolute left-5 top-5 rounded-full bg-green-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  After
                </span>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  The Solution
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
                  Responsible disposal and proper waste collection
                  help create cleaner, safer public spaces for the
                  whole community.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Did You Know? */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Knowledge Is the First Step"
            title="Did You"
            highlight="Know?"
            description="Understanding the impact of waste helps us make smarter choices every day."
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {facts.map((fact) => {
              const Icon = fact.icon;

              return (
                <article
                  key={fact.title}
                  data-reveal
                  className="rounded-2xl border border-green-100 bg-green-50/70 p-7 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8"
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-2xl text-green-700 dark:bg-green-900/50 dark:text-green-400">
                    <Icon aria-hidden="true" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {fact.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                    {fact.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-3xl border border-green-100 bg-green-50 p-7 dark:border-gray-700 dark:bg-gray-800 sm:p-10 md:grid-cols-2 md:items-center lg:p-14">
          <div data-reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-green-700 dark:text-green-400 sm:text-sm">
              The Power of Small Actions
            </p>

            <h2 className="text-3xl font-extrabold leading-tight text-gray-800 dark:text-white sm:text-4xl">
              A Better City
              <span className="block text-green-600 dark:text-green-400">
                Starts With You
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
              Keeping our environment clean is a shared
              responsibility. Every responsible choice helps build
              a cleaner and more welcoming community.
            </p>
          </div>

          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                data-reveal
                className="flex items-start gap-4 rounded-xl border border-green-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  <FaCheck aria-hidden="true" />
                </span>

                <p className="text-sm leading-6 text-gray-700 dark:text-gray-200 sm:text-base">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Call To Action */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-green-700 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[40px] border-white/10" />

          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-green-500/30 blur-3xl" />

          <div
            data-reveal
            className="relative flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left"
          >
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-green-50">
                <FaLocationDot aria-hidden="true" />
                Take Action Today
              </div>

              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                Help Keep Your City Clean
              </h2>

              <p className="mt-4 text-sm leading-7 text-green-50 sm:text-base">
                Found a dirty spot? Report it through EcoPulse and
                help your community take the next step toward cleaner
                streets.
              </p>
            </div>

            <Link
              to="/report"
              className="inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-7 py-4 font-bold text-green-800 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-300 sm:w-auto"
            >
              Report Waste
              <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Awareness;
