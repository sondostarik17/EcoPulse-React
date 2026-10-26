import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import {Home,Leaf,MapPinned,ClipboardList,UserRound,Globe2,Sun,Moon,Menu,X,LogIn,LogOut,ChevronDown,Recycle,
} from "lucide-react";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Awareness", path: "/awareness", icon: Leaf },
  { name: "Map & Report", path: "/report", icon: MapPinned },
  { name: "Track Reports", path: "/track", icon: ClipboardList },
  { name: "Profile", path: "/profile", icon: UserRound },
];

const languages = [
  { name: "English", code: "en" },
  { name: "العربية", code: "ar" },
  { name: "Français", code: "fr" },
  { name: "Español", code: "es" },
  { name: "Deutsch", code: "de" },
  { name: "Italiano", code: "it" },
  { name: "Português", code: "pt" },
  { name: "Русский", code: "ru" },
  { name: "Türkçe", code: "tr" },
  { name: "中文", code: "zh-CN" },
  { name: "日本語", code: "ja" },
  { name: "한국어", code: "ko" },
  { name: "हिन्दी", code: "hi" },
  { name: "اردو", code: "ur" },
  { name: "فارسی", code: "fa" },
  { name: "Nederlands", code: "nl" },
  { name: "Polski", code: "pl" },
  { name: "Українська", code: "uk" },
  { name: "Ελληνικά", code: "el" },
  { name: "Svenska", code: "sv" },
  { name: "ไทย", code: "th" },
  { name: "Tiếng Việt", code: "vi" },
  { name: "Indonesia", code: "id" },
  { name: "বাংলা", code: "bn" },
  { name: "עברית", code: "iw" },
  { name: "Română", code: "ro" },
  { name: "Čeština", code: "cs" },
  { name: "Dansk", code: "da" },
  { name: "Suomi", code: "fi" },
  { name: "Norsk", code: "no" },
  { name: "Bahasa Melayu", code: "ms" },
  { name: "Kiswahili", code: "sw" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const savedTheme = localStorage.getItem("theme");

    return savedTheme
      ? savedTheme === "dark"
      : document.documentElement.classList.contains("dark");
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return (
      typeof window !== "undefined" &&
      localStorage.getItem("isLoggedIn") === "true"
    );
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  // Keep theme synchronized with the whole website.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Update login state when another page logs in or out.
  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener("authChanged", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authChanged", syncAuth);
    };
  }, []);

  // Close the mobile menu after navigating to another page.
  useEffect(() => {
    setMenuOpen(false);
    setLanguageOpen(false);
  }, [location.pathname]);

  // Load the website translation widget.
  useEffect(() => {
    window.gtranslateSettings = {
      default_language: "en",
      languages: languages.map((language) => language.code),
      wrapper_selector: ".gtranslate_wrapper",
    };

    const existingScript = document.querySelector(
      'script[data-ecopulse-gtranslate="true"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");

      script.src =
        "https://cdn.gtranslate.net/widgets/latest/dropdown.js";

      script.async = true;
      script.dataset.ecopulseGtranslate = "true";

      document.body.appendChild(script);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((current) => !current);
  };

  const handleAuth = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    localStorage.setItem("isLoggedIn", "false");

    setIsLoggedIn(false);

    window.dispatchEvent(new Event("authChanged"));

    setMenuOpen(false);
    navigate("/");
  };

  const changeLanguage = (code) => {
    const translateSelect = document.querySelector(
      ".gtranslate_wrapper select"
    );

    if (!translateSelect) {
      setLanguageOpen(false);
      return;
    }

    const option = Array.from(translateSelect.options).find((item) => {
      return (
        item.value.endsWith(`/${code}`) ||
        item.value.endsWith(`|${code}`)
      );
    });

    if (option) {
      translateSelect.value = option.value;

      translateSelect.dispatchEvent(
        new Event("change", { bubbles: true })
      );
    }

    setLanguageOpen(false);
  };

  const authButtonClass = isLoggedIn
    ? "border border-red-500/20 bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/30"
    : "border border-emerald-500/20 bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/30";

  const baseIconButton =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2";

  const iconButtonClass = `${baseIconButton} border-gray-200 bg-white text-gray-700 hover:border-emerald-500/40 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.09] focus:ring-emerald-500/30`;

  const getNavClass = (path) => {
    const isActive =
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(`${path}/`));

    return `group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${isActive
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
      }`;
  };

  return (
    <>
      {/* Translation widget container */}
      <div className="gtranslate_wrapper hidden" aria-hidden="true" />

      <header className="sticky top-3 z-50 mx-auto mb-5 w-[calc(100%-1rem)] max-w-[1600px] rounded-2xl border border-gray-200/80 bg-white/95 shadow-[0_8px_35px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-colors duration-300 dark:border-white/10 dark:bg-gray-950/95 dark:shadow-[0_8px_35px_rgba(0,0,0,0.25)] sm:w-[calc(100%-2rem)] lg:w-[calc(100%-3rem)]">
        <div className="flex min-h-[76px] items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:gap-5 lg:px-6 xl:px-7">
          {/* Logo */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label="EcoPulse Home"
          >


            <div className="hidden min-[390px]:block">
              <span className="block text-[20px] font-extrabold leading-tight tracking-[-0.7px] text-gray-950 dark:text-white sm:text-[22px]">
                Eco<span className="text-emerald-600">Pulse</span>
              </span>

              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[2.3px] text-gray-500 dark:text-gray-400 sm:text-[10px]">
                Make Every Street Clean
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden flex-1 items-center justify-center gap-1 xl:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getNavClass(item.path)}
                  aria-current={
                    location.pathname === item.path ? "page" : undefined
                  }
                >
                  <Icon
                    size={16}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right-side controls */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            {/* Language menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setLanguageOpen((current) => !current);
                  setMenuOpen(false);
                }}
                className={iconButtonClass}
                aria-label="Choose language"
                aria-expanded={languageOpen}
                title="Choose language"
              >
                <i className="bi bi-translate text-green-600 text-lg"></i>     
                         </button>

              {languageOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-[70] w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-gray-950 dark:shadow-black/40 sm:w-60">
                  <div className="flex items-center justify-between border-b border-gray-100 px-3 pb-3 pt-2 dark:border-white/10">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Website Language
                      </p>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Select your language
                      </p>
                    </div>

                    <Globe2
                      size={18}
                      className="text-emerald-600"
                    />
                  </div>

                  <div className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        onClick={() => changeLanguage(language.code)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-200 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300"
                      >
                        <span>{language.name}</span>

                        {language.code === "en" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            Default
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light mode */}
            <button
              type="button"
              onClick={toggleTheme}
              className={iconButtonClass}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? (
                <Sun
                  size={19}
                  strokeWidth={1.9}
                  className="text-amber-400"
                />
              ) : (
                <Moon
                  size={19}
                  strokeWidth={1.9}
                  className="text-gray-700 dark:text-gray-200"
                />
              )}
            </button>

            {/* Desktop Login / Logout */}
            <button
              type="button"
              onClick={handleAuth}
              className={`hidden min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 xl:inline-flex ${authButtonClass}`}
            >
              {isLoggedIn ? (
                <>
                  <LogOut size={16} />
                  <span>Logout</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Login</span>
                </>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen((current) => !current);
                setLanguageOpen(false);
              }}
              className={`${iconButtonClass} xl:hidden`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
          <div className="border-t border-gray-200/80 px-3 pb-4 pt-3 dark:border-white/10 sm:px-5 xl:hidden">
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50/80 p-3 dark:bg-emerald-400/[0.07]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Recycle size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  EcoPulse
                </p>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Cleaner streets, better future
                </p>
              </div>
            </div>

            <nav
              className="grid grid-cols-1 gap-1 min-[480px]:grid-cols-2"
              aria-label="Mobile navigation"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/[0.06]"
                      }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={18} />

                    <span>{item.name}</span>

                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-gray-200/80 pt-3 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleAuth();
                }}
                className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 ${isLoggedIn
                    ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/30"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/30"
                  }`}
              >
                {isLoggedIn ? (
                  <>
                    <LogOut size={17} />
                    <span>Logout</span>
                  </>
                ) : (
                  <>
                    <LogIn size={17} />
                    <span>Login</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}