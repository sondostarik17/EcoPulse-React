import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
        <Link to="/" className="text-xl font-bold">
          <span className="text-green-600">Eco</span>
          <span className="text-gray-800 dark:text-white">Pulse</span>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Together for a cleaner environment.
        </p>

        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} EcoPulse
        </p>
      </div>
    </footer>
  );
}

export default Footer;