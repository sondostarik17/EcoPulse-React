
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import Swal from "sweetalert2";
import {
  MapPin,
  Navigation,
  Search,
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  LocateFixed,
} from "lucide-react";

const DEFAULT_LOCATION = {
  lat: 26.557,
  lng: 31.6948,
};

const POSSIBLE_WASTE_OBJECTS = new Set([
  "bottle",
  "cup",
  "wine glass",
  "bowl",
  "fork",
  "knife",
  "spoon",
  "book",
  "toothbrush",
  "backpack",
  "handbag",
  "suitcase",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
]);

const ReportWaste = () => {
  const navigate = useNavigate();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const modelRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const imageRequestRef = useRef(0);
  const addressRequestRef = useRef(0);
  const locationActionRef = useRef(0);

  const [coordinates, setCoordinates] = useState(DEFAULT_LOCATION);
  const [address, setAddress] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [description, setDescription] = useState("");

  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationStatus, setLocationStatus] = useState("detecting");
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [aiStatus, setAiStatus] = useState("loading");
  const [aiMessage, setAiMessage] = useState(
    "Loading AI object detector..."
  );
  const [aiResult, setAiResult] = useState(null);

  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass =
    "w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-white/10 dark:bg-[#080808] dark:text-white dark:placeholder:text-gray-500";

  const getAlertOptions = () => {
    const isDark =
      document.documentElement.classList.contains("dark");

    return {
      background: isDark ? "#0D0D0F" : "#FFFFFF",
      color: isDark ? "#F5F5F5" : "#111827",
      confirmButtonColor: "#22C55E",
    };
  };

  // Reverse-geocode coordinates into a readable address.
  const getAddressFromCoordinates = async (lat, lng) => {
    const coordinatesText =
      `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`
      );

      if (!response.ok) {
        throw new Error("Address lookup failed");
      }

      const data = await response.json();

      return (
        data.display_name ||
        `Selected coordinates: ${coordinatesText}`
      );
    } catch (error) {
      console.error("Address lookup error:", error);

      // Coordinates remain available even when the address service fails.
      return `Selected coordinates: ${coordinatesText}`;
    }
  };

  // Update the selected map point.
  const updateLocation = async (
    lat,
    lng,
    moveMap = true,
    accuracy = null,
    source = "manual"
  ) => {
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return;
    }

    // If the user manually selects a place, ignore an older GPS response.
    if (source !== "gps") {
      locationActionRef.current += 1;
    }

    const requestNumber = ++addressRequestRef.current;

    setCoordinates({ lat, lng });
    setLocationConfirmed(true);
    setLocationAccuracy(accuracy);

    if (source === "gps") {
      setLocationStatus(
        accuracy != null && accuracy > 1500
          ? "approximate"
          : "located"
      );
    } else {
      setLocationStatus("selected");
    }

    markerRef.current?.setLatLng([lat, lng]);

    if (moveMap && mapRef.current) {
      mapRef.current.setView([lat, lng], 17);
    }

    setAddress("Getting address...");

    const newAddress = await getAddressFromCoordinates(lat, lng);

    // Don't let an old address request overwrite a newer selection.
    if (requestNumber !== addressRequestRef.current) return;

    setAddress(newAddress);
    setSearchAddress(newAddress);
  };

  // Request the actual location provided by the browser/device.
  const requestCurrentLocation = (showError = true) => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");

      if (showError) {
        Swal.fire({
          ...getAlertOptions(),
          icon: "error",
          title: "Location unavailable",
          text: "Your browser does not support location services.",
        });
      }

      return;
    }

    const actionNumber = locationActionRef.current;

    setIsLocating(true);
    setLocationStatus("detecting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Ignore a GPS result if the user selected another point meanwhile.
        if (actionNumber !== locationActionRef.current) {
          setIsLocating(false);
          return;
        }

        try {
          await updateLocation(
            position.coords.latitude,
            position.coords.longitude,
            true,
            position.coords.accuracy,
            "gps"
          );
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);

        if (error.code === 1) {
          setLocationStatus("denied");
        } else if (error.code === 3) {
          setLocationStatus("timeout");
        } else {
          setLocationStatus("unavailable");
        }

        if (showError) {
          Swal.fire({
            ...getAlertOptions(),
            icon: "warning",
            title: "Could not determine your location",
            text:
              error.code === 1
                ? "Allow location access in your browser settings, then try again."
                : "Check your device location services or select the point on the map.",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // Gradually reveal page elements while scrolling.
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
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px",
      }
    );

    elements.forEach((element, index) => {
      element.classList.add("reveal-item");
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index * 55, 330)}ms`
      );
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Initialize the map.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const customIcon = L.divIcon({
      className: "ecopulse-map-marker",
      html: `
        <div style="
          width:36px;
          height:36px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#22C55E;
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 0 20px rgba(34,197,94,.4);
        ">
          <div style="
            width:10px;
            height:10px;
            background:white;
            border-radius:50%;
          "></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const map = L.map(mapContainerRef.current, {
      center: [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    const marker = L.marker(
      [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng],
      {
        icon: customIcon,
        draggable: true,
      }
    ).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    marker.on("dragend", () => {
      const position = marker.getLatLng();

      updateLocation(
        position.lat,
        position.lng,
        false,
        null,
        "manual"
      );
    });

    map.on("click", (event) => {
      updateLocation(
        event.latlng.lat,
        event.latlng.lng,
        false,
        null,
        "manual"
      );
    });

    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resize the map after the page has rendered.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  // Load the object detection model.
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const model = await cocoSsd.load({
          base: "lite_mobilenet_v2",
        });

        if (cancelled) {
          model.dispose?.();
          return;
        }

        modelRef.current = model;

        setAiStatus((current) =>
          current === "loading" ? "ready" : current
        );

        setAiMessage((current) =>
          current === "Loading AI object detector..."
            ? "AI is ready. Upload a photo to detect visible objects."
            : current
        );
      } catch (error) {
        console.error("AI model loading error:", error);

        if (!cancelled) {
          modelRef.current = null;
          setAiStatus("unavailable");
          setAiMessage(
            "AI could not load. You can still submit a photo for manual review."
          );
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  // Automatically request the device's current location on page load.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      requestCurrentLocation(false);
    }, 350);

    return () => window.clearTimeout(timer);
    // Run once when this page is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search for a street, area, address, or latitude/longitude.
  const handleSearchAddress = async (event) => {
    event.preventDefault();

    const query = searchAddress.trim();

    if (!query) {
      await Swal.fire({
        ...getAlertOptions(),
        icon: "info",
        title: "Enter a location",
        text: "Type an address or coordinates to search.",
      });
      return;
    }

    setIsSearching(true);

    try {
      // Example: 26.54120, 31.69270
      const coordinatesMatch = query.match(
        /^\s*(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)\s*$/
      );

      if (coordinatesMatch) {
        const lat = Number(coordinatesMatch[1]);
        const lng = Number(coordinatesMatch[2]);

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {
          throw new Error("Invalid coordinates");
        }

        await updateLocation(lat, lng, true, null, "manual");
        return;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ar&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Address search failed");
      }

      const results = await response.json();

      if (!results.length) {
        await Swal.fire({
          ...getAlertOptions(),
          icon: "info",
          title: "Location not found",
          text: "Try another address or enter latitude and longitude.",
        });
        return;
      }

      const result = results[0];

      await updateLocation(
        Number(result.lat),
        Number(result.lon),
        true,
        null,
        "manual"
      );
    } catch (error) {
      console.error("Location search error:", error);

      await Swal.fire({
        ...getAlertOptions(),
        icon: "error",
        title: "Search failed",
        text: "Please check the address or coordinates and try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Upload a photo and attempt object detection.
  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      await Swal.fire({
        ...getAlertOptions(),
        icon: "error",
        title: "Invalid file",
        text: "Please choose an image file.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await Swal.fire({
        ...getAlertOptions(),
        icon: "warning",
        title: "Image too large",
        text: "Please choose an image smaller than 5 MB.",
      });
      return;
    }

    const requestNumber = ++imageRequestRef.current;

    setImageFile(file);
    setImagePreview("");
    setAiResult(null);
    setAiStatus("checking");
    setAiMessage("Checking the objects visible in your photo...");

    const reader = new FileReader();

    reader.onerror = () => {
      if (requestNumber !== imageRequestRef.current) return;

      setImageFile(null);
      setImagePreview("");
      setAiResult(null);
      setAiStatus("unavailable");
      setAiMessage(
        "The image could not be read. Please choose another photo."
      );
    };

    reader.onload = async () => {
      if (requestNumber !== imageRequestRef.current) return;

      const dataUrl = String(reader.result || "");
      setImagePreview(dataUrl);

      // The AI is optional; a missing model does not reject the photo.
      if (!modelRef.current) {
        setAiResult(null);
        setAiStatus("unavailable");
        setAiMessage(
          "AI detection is unavailable. You can still submit this photo for manual review."
        );
        return;
      }

      const imageElement = new window.Image();

      imageElement.onload = async () => {
        if (requestNumber !== imageRequestRef.current) return;

        try {
          const predictions = await modelRef.current.detect(
            imageElement,
            20,
            0.2
          );

          if (requestNumber !== imageRequestRef.current) return;

          const possibleWaste = predictions
            .filter(
              (prediction) =>
                POSSIBLE_WASTE_OBJECTS.has(
                  prediction.class.toLowerCase()
                ) &&
                prediction.score >= 0.25
            )
            .sort((a, b) => b.score - a.score);

          setAiResult({
            detections: possibleWaste.slice(0, 5),
            otherObjects: predictions
              .filter(
                (prediction) =>
                  !POSSIBLE_WASTE_OBJECTS.has(
                    prediction.class.toLowerCase()
                  )
              )
              .slice(0, 3),
          });

          if (possibleWaste.length > 0) {
            setAiStatus("success");
            setAiMessage(
              `Possible object detected: ${possibleWaste[0].class}. This is a suggestion, not final verification.`
            );
          } else {
            setAiStatus("review");
            setAiMessage(
              "The AI did not recognize a relevant object. Your photo can still be submitted for manual review."
            );
          }
        } catch (error) {
          console.error("AI detection error:", error);

          if (requestNumber !== imageRequestRef.current) return;

          setAiResult(null);
          setAiStatus("unavailable");
          setAiMessage(
            "AI checking failed, but you can still submit your photo for manual review."
          );
        }
      };

      imageElement.onerror = () => {
        if (requestNumber !== imageRequestRef.current) return;

        setAiResult(null);
        setAiStatus("unavailable");
        setAiMessage(
          "The image preview could not be opened. You can still submit it for review."
        );
      };

      imageElement.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    imageRequestRef.current += 1;

    setImageFile(null);
    setImagePreview("");
    setAiResult(null);
    setAiStatus(modelRef.current ? "ready" : "unavailable");

    setAiMessage(
      modelRef.current
        ? "AI is ready. Upload another photo to detect visible objects."
        : "AI is unavailable. You can still submit a photo for manual review."
    );
  };

  // Validate and save the report.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    // Require login before saving.
    if (localStorage.getItem("isLoggedIn") !== "true") {
      const result = await Swal.fire({
        ...getAlertOptions(),
        icon: "warning",
        title: "Login Required",
        text: "Please log in before submitting a waste report.",
        confirmButtonText: "Go to Login",
        cancelButtonText: "Cancel",
        showCancelButton: true,
        allowOutsideClick: false,
      });

      if (result.isConfirmed) {
        navigate("/login");
      }

      return;
    }

    if (!imageFile || !imagePreview) {
      await Swal.fire({
        ...getAlertOptions(),
        icon: "warning",
        title: "Photo required",
        text: "Upload a photo before submitting.",
      });
      return;
    }

    if (!description.trim()) {
      await Swal.fire({
        ...getAlertOptions(),
        icon: "warning",
        title: "Description required",
        text: "Describe the waste problem before submitting.",
      });
      return;
    }

    if (
      !locationConfirmed ||
      !address.trim() ||
      address === "Getting address..."
    ) {
      await Swal.fire({
        ...getAlertOptions(),
        icon: "warning",
        title: "Confirm your location",
        text: "Use My Location or select the correct point on the map before submitting.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let savedReports;

      try {
        savedReports = JSON.parse(
          localStorage.getItem("allReports") || "[]"
        );
      } catch {
        savedReports = [];
      }

      if (!Array.isArray(savedReports)) {
        savedReports = [];
      }

      const hasPossibleMatch =
        aiStatus === "success" &&
        Boolean(aiResult?.detections?.length);

      const detectedLabels =
        aiResult?.detections
          ?.map((item) => item.class)
          .join(", ") || "";

      const confidence =
        hasPossibleMatch &&
        aiResult.detections[0]?.score != null
          ? Math.round(aiResult.detections[0].score * 100)
          : null;

      const newReport = {
        requestId: `#${Date.now()}`,
        location: address.trim(),
        description: description.trim(),
        image: imagePreview,
        date: new Date().toISOString(),
        statusText: "Pending",
        statusSub: "Your report is under review",

        // Save the actual selected point, not an inferred address.
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        locationAccuracyMeters: locationAccuracy,

        aiReviewStatus: hasPossibleMatch
          ? "suggested-match"
          : "manual-review",
        aiLabel: detectedLabels || "Manual review required",
        aiConfidence: confidence,

        estimatedQuantity: null,
        quantityEstimateStatus: "unavailable",
      };

      localStorage.setItem(
        "allReports",
        JSON.stringify([newReport, ...savedReports])
      );

      // Update the Track page in the current tab.
      window.dispatchEvent(new Event("reportsUpdated"));

      await Swal.fire({
        ...getAlertOptions(),
        icon: "success",
        title: "Report Submitted!",
        text: hasPossibleMatch
          ? "Your report has been saved and is waiting for review."
          : "Your report has been saved for manual review.",
        confirmButtonText: "View My Reports",
        allowOutsideClick: false,
      });

      navigate("/track");
    } catch (error) {
      console.error("Report submission error:", error);

      await Swal.fire({
        ...getAlertOptions(),
        icon: "error",
        title: "Could not save report",
        text: "Browser storage may be full. Try a smaller photo and submit again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const aiColors = {
    ready:
      "border-gray-200 bg-gray-50 text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300",
    loading:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300",
    checking:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300",
    success:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400",
    review:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    unavailable:
      "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-300",
  };

  const locationMessage = {
    detecting: "Finding your current device location...",
    located: "Current device location selected.",
    approximate:
      "The device returned an approximate location. Move the marker closer if needed.",
    selected: "Location selected from the map or search.",
    denied:
      "Location permission was denied. Allow it in your browser settings.",
    unavailable:
      "The device could not determine your location.",
    timeout:
      "Getting your location timed out. Try again.",
    unsupported:
      "Your browser does not support automatic location.",
  }[locationStatus];

  return (
    <main className="min-h-screen bg-gray-50 px-3 py-5 text-gray-900 transition-colors duration-300 dark:bg-[#050505] dark:text-[#F5F5F5] sm:px-6 sm:py-8 lg:px-8">
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          min-height: 280px;
          border-radius: 16px;
          z-index: 1;
          background: #f9fafb;
        }

        .dark .leaflet-container {
          background: #080808;
        }

        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255, 255, 255, 0.9) !important;
        }

        .dark .leaflet-control-attribution {
          background: rgba(13, 13, 15, 0.9) !important;
          color: #d1d5db;
        }

        .leaflet-control-zoom a {
          color: #111111 !important;
        }

        .ecopulse-map-marker {
          background: transparent;
          border: none;
        }

        .report-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #16a34a #e5e7eb;
        }

        .dark .report-scrollbar {
          scrollbar-color: #166534 #0D0D0F;
        }

        .report-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .report-scrollbar::-webkit-scrollbar-track {
          background: #e5e7eb;
        }

        .dark .report-scrollbar::-webkit-scrollbar-track {
          background: #0D0D0F;
        }

        .report-scrollbar::-webkit-scrollbar-thumb {
          background: #16a34a;
          border-radius: 10px;
        }

        .dark .report-scrollbar::-webkit-scrollbar-thumb {
          background: #166534;
        }

        .reveal-item {
          opacity: 0;
          transform: translateY(22px);
          transition:
            opacity 650ms ease,
            transform 650ms ease;
          transition-delay: var(--reveal-delay, 0ms);
        }

        .reveal-item.reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes submitGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(34,197,94,.15);
          }
          50% {
            box-shadow: 0 0 22px rgba(34,197,94,.35);
          }
        }

        .submit-glow {
          animation: submitGlow 1.2s ease-in-out infinite;
        }

        @media (max-width: 1023px) {
          .report-map-panel,
          .report-form-panel {
            height: auto;
            min-height: 0;
          }
        }

        @media (max-width: 640px) {
          .leaflet-container {
            min-height: 280px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-item,
          .reveal-item.reveal-visible {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .submit-glow {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <header className="mb-6 sm:mb-8" data-reveal>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-green-600 dark:text-green-400 sm:text-sm sm:tracking-[0.22em]">
            <Sparkles size={16} />
            EcoPulse Community
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Report Waste
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
            Help keep our streets clean. Select the location,
            add a photo, and tell us what needs attention.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6">
          {/* MAP PANEL - LEFT */}
          <section
            data-reveal
            className="report-map-panel flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-200/40 transition-colors duration-300 dark:border-white/10 dark:bg-[#0D0D0F] dark:shadow-black/20 sm:p-5 lg:h-[720px]"
          >
            <div
              data-reveal
              className="mb-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
                  <MapPin
                    size={20}
                    className="shrink-0 text-green-600 dark:text-green-400"
                  />
                  Select Your Location
                </h2>

                <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400 sm:text-sm">
                  The page tries to find your device location automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={() => requestCurrentLocation(true)}
                disabled={isLocating}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-50 px-3 py-2.5 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 sm:text-sm"
              >
                {isLocating ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <LocateFixed size={16} />
                )}
                {isLocating ? "Locating..." : "My Location"}
              </button>
            </div>

            {/* Address search */}
            <form
              data-reveal
              onSubmit={handleSearchAddress}
              className="mb-4 flex min-w-0 gap-2"
            >
              <div className="relative min-w-0 flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  value={searchAddress}
                  onChange={(event) =>
                    setSearchAddress(event.target.value)
                  }
                  placeholder="Search address or coordinates..."
                  aria-label="Search address or coordinates"
                  className={`${inputClass} pl-10`}
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-green-500 px-3 py-3 text-sm font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
              >
                {isSearching ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                <span>Search</span>
              </button>
            </form>

            {/* Map */}
            <div
              data-reveal
              className="relative h-[300px] min-h-[280px] overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 sm:h-[380px] lg:h-auto lg:min-h-0 lg:flex-1"
            >
              <div
                ref={mapContainerRef}
                className="absolute inset-0"
                aria-label="Choose a location on the map"
              />
            </div>

            {/* Selected location */}
            <div
              data-reveal
              className="mt-4 flex min-w-0 items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-500/20 dark:bg-green-500/[0.04] sm:p-4"
            >
              <MapPin
                size={19}
                className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
              />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400">
                  Selected Location
                </p>

                <p className="mt-1 break-words text-sm leading-5 text-gray-700 dark:text-gray-300">
                  {address ||
                    "Waiting for your location. You can also select a point on the map."}
                </p>

                <p className="mt-2 break-all text-xs text-gray-500">
                  {coordinates.lat.toFixed(6)},{" "}
                  {coordinates.lng.toFixed(6)}
                </p>

                {locationAccuracy != null && (
                  <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    Reported GPS accuracy: approximately ±
                    {Math.round(locationAccuracy)} m
                  </p>
                )}

                <p
                  className={`mt-2 text-xs leading-5 ${
                    locationStatus === "denied" ||
                    locationStatus === "unavailable" ||
                    locationStatus === "timeout" ||
                    locationStatus === "unsupported" ||
                    locationStatus === "approximate"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-green-700 dark:text-green-400"
                  }`}
                >
                  {locationMessage}
                </p>
              </div>
            </div>
          </section>

          {/* REPORT FORM - RIGHT */}
          <section
            data-reveal
            className="report-form-panel flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/40 transition-colors duration-300 dark:border-white/10 dark:bg-[#0D0D0F] dark:shadow-black/20 lg:h-[720px]"
          >
            <div
              data-reveal
              className="border-b border-gray-200 p-4 dark:border-white/10 sm:p-6"
            >
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FileText
                  size={21}
                  className="text-green-600 dark:text-green-400"
                />
                Report Details
              </h2>

              <p className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-400">
                Add the information about the waste problem.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="report-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                {/* Photo upload */}
                <div data-reveal>
                  <label className="mb-2 block text-sm font-semibold">
                    Waste Photo <span className="text-red-500">*</span>
                  </label>

                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
                      <img
                        src={imagePreview}
                        alt="Selected waste"
                        className="h-48 w-full object-cover sm:h-56"
                      />

                      <button
                        type="button"
                        onClick={removeImage}
                        aria-label="Remove selected image"
                        className="absolute right-3 top-3 rounded-xl bg-black/80 p-2.5 text-white transition hover:bg-red-600"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 flex min-w-0 items-center gap-2 bg-black/80 px-3 py-2.5 text-xs text-white">
                        {aiStatus === "success" ? (
                          <CheckCircle2
                            size={15}
                            className="shrink-0 text-green-400"
                          />
                        ) : (
                          <ImageIcon
                            size={15}
                            className="shrink-0 text-green-400"
                          />
                        )}

                        <span className="truncate">
                          {imageFile?.name || "Image selected"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-300 bg-green-50 p-5 text-center transition hover:border-green-500 hover:bg-green-100 dark:border-green-500/25 dark:bg-green-500/[0.02] dark:hover:border-green-500/60 dark:hover:bg-green-500/[0.05]"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                        <Upload size={23} />
                      </div>

                      <span className="text-sm font-semibold">
                        Click to upload a photo
                      </span>

                      <span className="mt-1 text-xs leading-5 text-gray-500">
                        JPG, PNG or WEBP · Maximum 5 MB
                      </span>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-2 py-3 text-xs font-medium text-gray-700 transition hover:border-green-500/40 hover:text-green-700 dark:border-white/10 dark:text-gray-300 dark:hover:text-green-400 sm:px-3 sm:text-sm"
                    >
                      <Camera size={17} className="shrink-0" />
                      Take Photo
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-2 py-3 text-xs font-medium text-gray-700 transition hover:border-green-500/40 hover:text-green-700 dark:border-white/10 dark:text-gray-300 dark:hover:text-green-400 sm:px-3 sm:text-sm"
                    >
                      <ImageIcon size={17} className="shrink-0" />
                      Gallery
                    </button>
                  </div>
                </div>

                {/* AI object detection */}
                <div
                  data-reveal
                  className={`flex min-w-0 items-start gap-3 rounded-xl border p-3 sm:p-4 ${
                    aiColors[aiStatus] || aiColors.ready
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {aiStatus === "checking" ||
                    aiStatus === "loading" ? (
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                    ) : aiStatus === "success" ? (
                      <CheckCircle2 size={19} />
                    ) : aiStatus === "review" ||
                      aiStatus === "unavailable" ? (
                      <AlertCircle size={19} />
                    ) : (
                      <Sparkles size={19} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      AI Object Detection
                    </p>

                    <p className="mt-1 break-words text-xs leading-5 opacity-90">
                      {aiMessage}
                    </p>

                    {aiResult?.detections?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold">
                          Possible relevant objects:
                        </p>

                        {aiResult.detections.map((item, index) => (
                          <div
                            key={`${item.class}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-white/70 px-3 py-2 text-xs dark:border-green-500/20 dark:bg-black/20"
                          >
                            <span className="break-words font-semibold capitalize">
                              {item.class}
                            </span>

                            <span className="shrink-0">
                              {Math.round(item.score * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="mt-3 text-[11px] leading-5 opacity-70">
                      The AI recognizes objects from limited categories.
                      It may miss waste piles, so an uncertain result
                      will not block your report.
                    </p>
                  </div>
                </div>

                {/* Quantity estimate */}
                <div
                  data-reveal
                  className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-500/[0.04]"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles
                      size={19}
                      className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-green-700 dark:text-green-400">
                        AI Estimated Waste Quantity
                      </p>

                      <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Automatic estimate unavailable
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">
                        The current object detector cannot reliably
                        measure the amount of waste.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div data-reveal>
                  <label
                    htmlFor="wasteDescription"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="wasteDescription"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Describe the waste problem and details that can help the cleaning team..."
                    rows={4}
                    maxLength={1000}
                    required
                    className={`${inputClass} min-h-28 resize-y`}
                  />

                  <p className="mt-1 text-right text-xs text-gray-500">
                    {description.length}/1000
                  </p>
                </div>

                {/* Address */}
                <div data-reveal>
                  <label
                    htmlFor="reportAddress"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Location Address{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400"
                    />

                    <input
                      id="reportAddress"
                      value={address}
                      onChange={(event) =>
                        setAddress(event.target.value)
                      }
                      placeholder="Use My Location or choose a point..."
                      required
                      className={`${inputClass} pl-10`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => requestCurrentLocation(true)}
                    disabled={isLocating}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-green-700 transition hover:text-green-600 disabled:opacity-60 dark:text-green-400 dark:hover:text-green-300"
                  >
                    {isLocating ? (
                      <LoaderCircle
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Navigation size={14} />
                    )}

                    {isLocating
                      ? "Getting location..."
                      : "Use my current location"}
                  </button>
                </div>

                {/* Information */}
                <div
                  data-reveal
                  className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs leading-5 text-gray-600 dark:border-green-500/15 dark:bg-green-500/[0.025] dark:text-gray-400"
                >
                  The marker coordinates determine the report location.
                  The written address may be approximate if the map
                  does not contain a precise street address.
                </div>
              </div>

              {/* Submit */}
              <div
                data-reveal
                className="border-t border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#0D0D0F] sm:p-6"
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:bg-green-400 hover:shadow-[0_0_22px_rgba(34,197,94,0.25)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base ${
                    isSubmitting ? "submit-glow" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle
                        size={20}
                        className="animate-spin"
                      />
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Submit Report
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                  Thank you for helping keep our community clean.
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ReportWaste;
