import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Weather from './Weather';
import Highlights from './Highlights';
import HourlyForecast from './HourlyForecast';
import ChartPage from './pages/ChartPage';
import MapPage from './pages/MapPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import BackgroundManager from './BackgroundManager';
import DailyForecastList from './DailyForecastList';
import ProfilePage from './pages/ProfilePage';
import './Dashboard.css';

// Importing assets if they exist, otherwise we'll handle fallbacks in components
// The original project had these assets
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import rain_icon from '../assets/rain.png';
import snow_icon from '../assets/snow.png';
import wind_icon from '../assets/wind.png';
import humidity_icon from '../assets/humidity.png';

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState(() => {
        // Fallback to local storage or defaults initially, will update from API
        const saved = localStorage.getItem("userProfile");
        return saved ? JSON.parse(saved) : { fullName: location.state?.name || "Explorer" };
    });

    const [userName, setUserName] = useState(userProfile.fullName || "Explorer");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempName, setTempName] = useState("");
    const [activeTab, setActiveTab] = useState('dashboard');
    const [settingsStartSection, setSettingsStartSection] = useState('units');
    const [profileEditMode, setProfileEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [weatherData_v5, setWeatherData] = useState(() => {
        const saved = localStorage.getItem("weatherData_v5");
        return saved ? JSON.parse(saved) : null;
    });


    // --- Settings State (Hoisted to top for access) ---
    const [settings, setSettings] = useState(() => {
        const defaultSettings = {
            units: {
                temp: 'c', wind: 'kmh', precip: 'mm', pressure: 'hpa', distance: 'km', time: '12h'
            },
            notifications: {
                severe: true, nowcast: true, summary: 'morning', thresholds: { uv: false, freeze: true }, dnd: false
            },
            data: {
                provider: 'open-meteo', updateFreq: 'manual', bgRefresh: false
            },
            appearance: {
                theme: 'dark', dynamicBg: true, iconParams: 'default'
            },
            privacy: {
                locationAccess: 'while-using', preciseLocation: true, shareData: false
            },
            health: {
                pollen: { tree: true, grass: true, ragweed: true }, activity: 'default', haptic: true
            }
        };

        const saved = localStorage.getItem('appSettings');
        if (!saved) return defaultSettings;

        try {
            const parsed = JSON.parse(saved);
            return {
                ...defaultSettings,
                ...parsed,
                data: { ...defaultSettings.data, ...parsed.data },
                units: { ...defaultSettings.units, ...parsed.units },
                notifications: { ...defaultSettings.notifications, ...parsed.notifications },
                appearance: { ...defaultSettings.appearance, ...parsed.appearance },
                privacy: { ...defaultSettings.privacy, ...parsed.privacy },
                health: { ...defaultSettings.health, ...parsed.health }
            };
        } catch (e) {
            return defaultSettings;
        }
    });

    const getIcon = (wmoCode, isDay = 1) => {
        // High-Quality 3D Weather Icons (CDN)
        const baseUrl = "https://basmilius.github.io/weather-icons/production/fill/all/";

        // Map WMO codes to specific icon filenames
        const iconMap = {
            0: isDay ? 'clear-day.svg' : 'clear-night.svg',
            1: isDay ? 'partly-cloudy-day.svg' : 'partly-cloudy-night.svg',
            2: isDay ? 'partly-cloudy-day.svg' : 'partly-cloudy-night.svg',
            3: 'overcast.svg',
            45: 'fog.svg', 48: 'fog.svg',
            51: 'drizzle.svg', 53: 'drizzle.svg', 55: 'drizzle.svg',
            56: 'sleet.svg', 57: 'sleet.svg',
            61: 'rain.svg', 63: 'rain.svg', 65: 'rain.svg',
            66: 'sleet.svg', 67: 'sleet.svg',
            71: 'snow.svg', 73: 'snow.svg', 75: 'snow.svg', 77: 'snow.svg',
            80: 'rain.svg', 81: 'rain.svg', 82: 'rain.svg',
            85: 'snow.svg', 86: 'snow.svg',
            95: 'thunderstorms.svg', 96: 'thunderstorms-rain.svg', 99: 'thunderstorms-snow.svg'
        };

        const filename = iconMap[wmoCode] || (isDay ? 'clear-day.svg' : 'clear-night.svg');
        return `${baseUrl}${filename}`;
    };

    const fetchWeather = async (lat, lon, cityName) => {
        // Fallback to current weather data if no arguments provided (for auto-refresh)
        const targetLat = lat || weatherData_v5?.latitude;
        const targetLon = lon || weatherData_v5?.longitude;
        const targetName = cityName || weatherData_v5?.location;

        if (!targetLat || !targetLon) {
            console.log("No location provided for fetchWeather");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Fetch Weather + Air Quality
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,dew_point_2m,visibility&hourly=temperature_2m,weather_code,precipitation_probability,dew_point_2m,wind_speed_10m,pressure_msl,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;

            // Air Quality API
            const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${targetLat}&longitude=${targetLon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

            const [weatherRes, aqRes] = await Promise.all([
                fetch(weatherUrl),
                fetch(aqUrl)
            ]);

            const weatherData_v5Json = await weatherRes.json();
            const aqDataJson = await aqRes.json();

            if (!weatherData_v5Json.current) throw new Error("Weather data not available");

            const icon = getIcon(weatherData_v5Json.current.weather_code, weatherData_v5Json.current.is_day);

            // Human Readable Summary logic & Nowcast
            const currentTemp = weatherData_v5Json.current.temperature_2m;
            const feelsLike = weatherData_v5Json.current.apparent_temperature;

            // Nowcast Logic (Check next 2 hours of hourly data)
            const currentHour = new Date().getHours();
            const hourIdx = weatherData_v5Json.hourly.time.findIndex(t => new Date(t).getHours() === currentHour);
            let nowcast = "";
            let precipStart = -1;

            if (hourIdx !== -1) {
                const nextFewHours = weatherData_v5Json.hourly.precipitation_probability.slice(hourIdx, hourIdx + 3);
                precipStart = nextFewHours.findIndex(p => p > 30); // 30% chance threshold

                if (precipStart === 0) nowcast = "Rain continues for the next hour.";
                else if (precipStart === 1) nowcast = "Light rain starting in about 45 mins.";
                else if (precipStart > 1) nowcast = "Rain expected later this afternoon.";
                else nowcast = "No precipitation expected in the next 60 mins.";
            }

            const isRainy = weatherData_v5Json.current.precipitation > 0 || weatherData_v5Json.current.weather_code >= 51;
            let summary = `It feels like ${Math.round(feelsLike)}° with ${weatherData_v5Json.current.cloud_cover}% cloud cover.`;
            if (isRainy) summary = `Rain is falling. ${summary}`;
            else summary = `Conditions are clear. ${summary}`;

            // Define variables needed for activity scoring
            const windKmh = weatherData_v5Json.current.wind_speed_10m;
            const tempC = currentTemp;

            // --------------------------------------------------------------------------
            // 🛠️ CONFIGURATION: Add your favorite activities here!
            // --------------------------------------------------------------------------
            // Format: { name: 'activity_id', label: 'Display Name', idealTempMin: 10, idealTempMax: 20, maxWind: 20, rainTolerance: 0_to_2 }
            const USER_ACTIVITIES = [
                { id: 'running', label: 'Running', idealMin: 10, idealMax: 20, maxWind: 20, rainTol: 1 },
                { id: 'basketball', label: 'Basketball', idealMin: 15, idealMax: 28, maxWind: 20, rainTol: 0 },
                { id: 'cycling', label: 'Cycling', idealMin: 15, idealMax: 25, maxWind: 25, rainTol: 0 },
                { id: 'boating', label: 'Boating', idealMin: 20, idealMax: 30, maxWind: 15, rainTol: 0 },
                { id: 'gardening', label: 'Gardening', idealMin: 10, idealMax: 25, maxWind: 30, rainTol: 1 },
                { id: 'hiking', label: 'Hiking', idealMin: 5, idealMax: 25, maxWind: 30, rainTol: 1 },
                { id: 'fishing', label: 'Fishing', idealMin: 5, idealMax: 30, maxWind: 15, rainTol: 0 },
                { id: 'yoga', label: 'Yoga', idealMin: 18, idealMax: 30, maxWind: 10, rainTol: 0 },
                { id: 'stargazing', label: 'Stargazing', idealMin: 0, idealMax: 25, maxWind: 10, rainTol: 0 }
            ];

            // Activity Scoring Engine
            const calculateScore = (idealTempMin, idealTempMax, maxWind, rainTolerance, conditions) => {
                let score = 10;
                const { temp, wind, rain } = conditions;

                // Temp Penalty
                if (temp < idealTempMin) score -= (idealTempMin - temp) * 0.5;
                if (temp > idealTempMax) score -= (temp - idealTempMax) * 0.5;

                // Wind Penalty
                if (wind > maxWind) score -= (wind - maxWind) * 0.5;

                // Rain Penalty (Tolerance 0 = none, 1 = light, 2 = heavy)
                if (rain && rainTolerance === 0) score = 1; // Ruined
                if (rain && rainTolerance === 1) score -= 3; // Unpleasant

                return Math.max(1, Math.min(10, Math.round(score)));
            };

            const conditions = { temp: tempC, wind: windKmh, rain: isRainy };

            // Generate scores dynamically
            const activityScores = {};
            USER_ACTIVITIES.forEach(act => {
                activityScores[act.id] = calculateScore(act.idealMin, act.idealMax, act.maxWind, act.rainTol, conditions);
            });


            // Sun Safety
            const uv = weatherData_v5Json.daily.uv_index_max[0];
            let burnTime = "N/A";
            if (uv > 10) burnTime = "10 mins";
            else if (uv > 7) burnTime = "20 mins";
            else if (uv > 5) burnTime = "30 mins";
            else if (uv > 3) burnTime = "45 mins";
            else burnTime = "60+ mins";



            const combinedData = {
                location: targetName,
                temperature: Math.round(currentTemp),
                feelsLike: Math.round(feelsLike),
                humidity: weatherData_v5Json.current.relative_humidity_2m,
                dewPoint: Math.round(weatherData_v5Json.current.dew_point_2m),
                windSpeed: weatherData_v5Json.current.wind_speed_10m,
                windDirection: weatherData_v5Json.current.wind_direction_10m,
                pressure: weatherData_v5Json.current.pressure_msl,
                uvIndex: uv,
                burnTime: burnTime,
                visibility: (weatherData_v5Json.current.visibility / 1000).toFixed(1),
                sunrise: weatherData_v5Json.daily.sunrise[0],
                sunset: weatherData_v5Json.daily.sunset[0],
                icon: icon,
                precipitation: weatherData_v5Json.current.precipitation,
                weatherCode: weatherData_v5Json.current.weather_code,
                isDay: weatherData_v5Json.current.is_day,
                aqi: aqDataJson.current.us_aqi,
                pollutants: {
                    pm2_5: aqDataJson.current.pm2_5,
                    pm10: aqDataJson.current.pm10,
                    no2: aqDataJson.current.nitrogen_dioxide,
                    o3: aqDataJson.current.ozone
                },
                // Lifestyle Simulations
                activityScores: activityScores,

                pollen: ((wind, rain) => {
                    // Simple global simulation since Pollen API is regional
                    const month = new Date().getMonth(); // 0-11
                    const isSpring = month >= 2 && month <= 4;
                    const isSummer = month >= 5 && month <= 7;
                    const isFall = month >= 8 && month <= 10;

                    let tree = isSpring ? "High" : "Moderate";
                    let grass = isSummer ? "High" : "Moderate";
                    let ragweed = isFall ? "High" : "Low";

                    // Rain cleans the air
                    if (rain) {
                        tree = "Low";
                        grass = "Low";
                        ragweed = "Low";
                    }
                    // Wind spreads it
                    else if (wind > 20) {
                        if (tree === "Moderate") tree = "High";
                        if (grass === "Moderate") grass = "High";
                    }

                    return { tree, grass, ragweed };
                })(windKmh, isRainy),
                // Hourly and Daily for charts and lists
                hourly: weatherData_v5Json.hourly,
                daily: weatherData_v5Json.daily,
                latitude: lat,
                longitude: lon,
                summary: summary,
                nowcast: nowcast,
                lastUpdated: new Date().toISOString()
            };

            setWeatherData(combinedData);
            localStorage.setItem("weatherData_v5", JSON.stringify(combinedData));
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch weather. Using offline data if available.");
            setIsLoading(false);
        }
    };

    const search = async (city) => {
        if (!city.trim()) return;
        try {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                alert("City not found");
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];
            await fetchWeather(latitude, longitude, `${name}, ${country}`);
        } catch (error) {
            console.error("Geocoding error", error);
            alert("Error searching for city");
        }
    };

    const handleGeolocation = useCallback(() => {
        // Privacy Check: Location Access
        if (settings.privacy?.locationAccess === 'fixed') {
            alert("Location access is set to 'Fixed City Only'. Change this in settings to use GPS.");
            return;
        }

        if (!navigator.geolocation) {
            console.log("Geolocation not supported");
            if (!weatherData_v5) search("London");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                let { latitude, longitude } = position.coords;

                // Privacy Check: Precise Location
                if (settings.privacy?.preciseLocation === false) {
                    // Fuzzy location: round to 1 decimal place (~11km accuracy)
                    latitude = Number(latitude.toFixed(1));
                    longitude = Number(longitude.toFixed(1));
                    console.log("Using approximate location (privacy enabled)");
                }

                // Try to get city name from reverse geocoding if possible, or just use coords
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const cityName = data.address.city || data.address.town || data.address.village || "Current Location";
                    await fetchWeather(latitude, longitude, cityName);
                } catch (e) {
                    await fetchWeather(latitude, longitude, `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                }
            },
            (err) => {
                console.error(err);
                if (!weatherData_v5) search("New York"); // Default fallback
            }
        );
    }, [search, weatherData_v5, settings.privacy]);

    // Diagnostics Logging (Simulated)
    useEffect(() => {
        if (settings.privacy?.shareData) {
            console.log("Diagnostics & Analytics: ENABLED (Sending anonymous usage data...)");
        }
    }, [settings.privacy?.shareData]);

    useEffect(() => {
        if (!weatherData_v5) {
            handleGeolocation();
        } else {
            // Check if data is old (> 30 mins) or missing coordinates
            const lastUpdate = new Date(weatherData_v5.lastUpdated);
            const diff = (new Date() - lastUpdate) / (1000 * 60);
            if (diff > 30 || !weatherData_v5.latitude) {
                handleGeolocation();
            } else {
                setIsLoading(false);
            }
        }
    }, []);

    // --- Backend Sync Logic ---
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const api = await import('../services/api');
                const userData = await api.getUserData();

                if (userData) {
                    // Update Settings from Backend
                    if (userData.settings) {
                        setSettings(prev => ({
                            ...prev,
                            ...userData.settings,
                            units: { ...prev.units, ...userData.settings.units },
                            notifications: { ...prev.notifications, ...userData.settings.notifications },
                            data: { ...prev.data, ...userData.settings.data },
                            appearance: { ...prev.appearance, ...userData.settings.appearance },
                            privacy: { ...prev.privacy, ...userData.settings.privacy },
                            health: { ...prev.health, ...userData.settings.health, pollen: { ...prev.health?.pollen, ...userData.settings.health?.pollen } }
                        }));
                        localStorage.setItem('appSettings', JSON.stringify(userData.settings)); // Note: this might save incomplete data to local storage, but app state is safe. Ideally we save the merged result.
                    }

                    // Update Profile - Backend is Source of Truth
                    const profile = {
                        fullName: userData.name,
                        email: userData.email,
                        username: userData.username,
                        phone: userData.phone,
                        address: userData.address,
                        location: userData.location
                    };
                    setUserProfile(profile);
                    setUserName(userData.name);
                    localStorage.setItem('userProfile', JSON.stringify(profile));
                }
            } catch (err) {
                console.error("Failed to sync with backend", err);
                // If 401, maybe logout? For now just ignore and work offline/local
                if (err.response && err.response.status === 401) {
                    navigate('/');
                }
            }
        };
        loadUserData();
    }, [navigate]);

    const handleLogout = () => {
        import('../services/api').then(module => module.logout());
        navigate('/');
    };
    const openModal = () => { setTempName(userName); setIsModalOpen(true); }
    const handleSave = (e) => {
        e.preventDefault();
        if (tempName.trim()) setUserName(tempName);
        setIsModalOpen(false);
    }
    const handleTabChange = (tab) => {
        if (tab === 'settings') setSettingsStartSection('units');
        setActiveTab(tab);
    };

    // --- Settings & Unit Logic ---


    // Refresh settings when tab changes (in case user updated them)
    // Sync Settings to Backend when they change
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (isInitialLoad) {
            setIsInitialLoad(false);
            return;
        }
        // Save locally
        localStorage.setItem('appSettings', JSON.stringify(settings));

        // Save to backend (debounced ideally, but direct for now)
        const syncSettings = async () => {
            try {
                const api = await import('../services/api');
                await api.updateSettings(settings);
            } catch (e) {
                console.error("Failed to save settings to cloud", e);
            }
        }
        syncSettings();
    }, [settings]); // Trigger on settings object change (deep check or assume immutable updates)

    // --- Notification Logic ---
    useEffect(() => {
        if (!weatherData_v5 || !settings.notifications) return;

        const { severe, nowcast, summary, dnd } = settings.notifications;

        // 1. Request Permission if needed
        if (Notification.permission === 'default' && (severe || nowcast || summary !== 'off')) {
            Notification.requestPermission();
        }

        if (Notification.permission !== 'granted') return;

        // 2. Do Not Disturb Check (10PM - 7AM)
        const currentHour = new Date().getHours();
        if (dnd && (currentHour >= 22 || currentHour < 7)) return;

        // 3. Severe Weather Alert (Simulated via code)
        if (severe) {
            const code = weatherData_v5.weatherCode;
            const isSevere = code >= 95; // Thunderstorm
            const lastAlert = localStorage.getItem('lastSevereAlert');
            // Prevent spamming: only alert once per 6 hours
            const timeSinceLast = lastAlert ? (Date.now() - parseInt(lastAlert)) : 36000000;

            if (isSevere && timeSinceLast > 21600000) { // 6 hours
                new Notification("Severe Weather Alert", {
                    body: "Thunderstorms detected in your area. Stay safe!",
                    icon: '/weather-icons/thunderstorms.svg'
                });
                localStorage.setItem('lastSevereAlert', Date.now().toString());
            }
        }

        // 4. Precipitation Nowcast
        if (nowcast) {
            const lastNowcast = localStorage.getItem('lastNowcastAlert');
            const timeSinceLast = lastNowcast ? (Date.now() - parseInt(lastNowcast)) : 36000000;
            const alertText = weatherData_v5.nowcast; // "Rain continues..." or "Light rain starting..."

            if (alertText && alertText.toLowerCase().includes("starting") && timeSinceLast > 3600000) { // 1 hour debounce
                new Notification("Precipitation Alert", {
                    body: alertText,
                    icon: '/weather-icons/rain.svg'
                });
                localStorage.setItem('lastNowcastAlert', Date.now().toString());
            }
        }

        // 5. Daily Summary
        if (summary && summary !== 'off') {
            const lastSummary = localStorage.getItem('lastDailySummary');
            const today = new Date().toDateString();

            // Check if already shown today
            if (lastSummary !== today) {
                // Morning Window: 6 AM - 10 AM
                if (summary === 'morning' && currentHour >= 6 && currentHour <= 10) {
                    new Notification("Daily Weather Summary", {
                        body: weatherData_v5.summary,
                        icon: '/weather-icons/clear-day.svg'
                    });
                    localStorage.setItem('lastDailySummary', today);
                }
                // Evening Window: 6 PM - 10 PM
                else if (summary === 'evening' && currentHour >= 18 && currentHour <= 22) {
                    new Notification("Evening Forecast Update", {
                        body: weatherData_v5.summary,
                        icon: '/weather-icons/clear-night.svg'
                    });
                    localStorage.setItem('lastDailySummary', today);
                }
            }
        }

    }, [weatherData_v5, settings.notifications]);

    // --- Data & Source Logic (Auto-Refresh) ---
    useEffect(() => {
        if (!settings.data) return;

        const { updateFreq, bgRefresh } = settings.data;

        // Clear existing interval if set
        const clearTimer = () => {
            if (window.weatherRefreshInterval) {
                clearInterval(window.weatherRefreshInterval);
                window.weatherRefreshInterval = null;
            }
        };

        clearTimer();

        if (updateFreq === 'manual') return;

        let ms = 0;
        if (updateFreq === '15min') ms = 15 * 60 * 1000;
        if (updateFreq === 'hourly') ms = 60 * 60 * 1000;

        if (ms > 0) {
            window.weatherRefreshInterval = setInterval(() => {
                // If Background Refresh is OFF, and document is hidden, skip update
                if (!bgRefresh && document.hidden) return;

                console.log(`Auto-refreshing weather data (${updateFreq})...`);
                fetchWeather();
            }, ms);
        }

        return () => clearTimer();
    }, [settings.data, fetchWeather]); // Re-run when settings change

    // Apply Theme
    useEffect(() => {
        const root = document.documentElement;
        const theme = settings.appearance.theme;

        const setLight = () => {
            root.style.setProperty('--bg-primary', '#f8fafc');
            root.style.setProperty('--bg-secondary', '#ffffff');
            root.style.setProperty('--text-primary', '#1e293b');
            root.style.setProperty('--text-secondary', '#64748b');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.7)');
            root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.05)');
        };

        const setDark = () => {
            root.style.setProperty('--bg-primary', '#0f172a');
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.setProperty('--text-primary', '#f8fafc');
            root.style.setProperty('--text-secondary', '#94a3b8');
            root.style.setProperty('--glass-bg', 'rgba(30, 41, 59, 0.7)');
            root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
        };

        if (theme === 'light') setLight();
        else if (theme === 'dark') setDark();
        else {
            // System
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.matches ? setDark() : setLight();
            // Optional: Listen for system changes (simplified here)
        }
    }, [settings.appearance.theme]);

    // Apply App Icon (Accent Colors & Palettes)
    useEffect(() => {
        const iconParams = settings.appearance.iconParams;
        const root = document.documentElement;

        if (iconParams === 'default') {
            // Ocean / Sky Palette (Blue/Yellow mix)
            root.style.setProperty('--accent-primary', '#77BEF0'); // Sky Blue
            root.style.setProperty('--accent-secondary', '#FCD34D'); // Warm Yellow
            root.style.setProperty('--accent-glow', 'rgba(119, 190, 240, 0.4)');
            root.style.setProperty('--text-on-accent', '#ffffff'); // White text works on Sky Blue
        } else if (iconParams === 'dark') {
            // Forest Palette (Deep Greens)
            root.style.setProperty('--accent-primary', '#2F5249'); // Deep Green
            root.style.setProperty('--accent-secondary', '#437057'); // Muted Green
            root.style.setProperty('--accent-glow', 'rgba(47, 82, 73, 0.4)');
            root.style.setProperty('--text-on-accent', '#ffffff'); // White text works on Dark Green
        } else if (iconParams === 'sunset') {
            // Citrus / Lime Palette (Light Green/Orange)
            root.style.setProperty('--accent-primary', '#D6D85D'); // Lime
            root.style.setProperty('--accent-secondary', '#f97316'); // Orange
            root.style.setProperty('--accent-glow', 'rgba(214, 216, 93, 0.4)');
            root.style.setProperty('--text-on-accent', '#0f172a'); // Dark text essential for Lime background
        }
    }, [settings.appearance.iconParams]);

    // Haptic Feedback Logic
    useEffect(() => {
        if (!settings.health?.haptic) return;

        const handleInteraction = (e) => {
            // Trigger haptic on clickable elements
            if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[role="button"]')) {
                if (navigator.vibrate) navigator.vibrate(10); // Light tap
            }
        };

        window.addEventListener('click', handleInteraction);
        return () => window.removeEventListener('click', handleInteraction);
    }, [settings.health?.haptic]);

    // Unit Conversion Helpers
    const convertTemp = (c) => {
        if (settings.units.temp === 'f') return Math.round((c * 9 / 5) + 32);
        if (settings.units.temp === 'k') return Math.round(c + 273.15);
        return Math.round(c);
    };

    const convertWind = (kmh) => {
        const u = settings.units.wind;
        if (u === 'mph') return Math.round(kmh * 0.621371);
        if (u === 'ms') return (kmh / 3.6).toFixed(1);
        if (u === 'knots') return Math.round(kmh / 1.852);
        if (u === 'beaufort') {
            if (kmh < 1) return 0;
            if (kmh < 6) return 1;
            if (kmh < 12) return 2;
            if (kmh < 20) return 3;
            if (kmh < 29) return 4;
            if (kmh < 39) return 5;
            if (kmh < 50) return 6;
            return 7; // simplified
        }
        return Math.round(kmh);
    };

    const convertPressure = (hpa) => {
        const u = settings.units.pressure;
        if (u === 'inhg') return (hpa / 33.8639).toFixed(2);
        if (u === 'kpa') return (hpa / 10).toFixed(1);
        return Math.round(hpa); // hpa & mbar are 1:1
    };

    const convertDist = (km) => {
        if (settings.units.distance === 'mi') return (km * 0.621371).toFixed(1);
        return km;
    };

    const convertPrecip = (mm) => {
        if (settings.units.precip === 'in') return (mm / 25.4).toFixed(2);
        return mm;
    };

    // Prepare Display Data
    const getDisplayData = () => {
        if (!weatherData_v5) return null;

        // Clone to avoid mutating original state
        const d = { ...weatherData_v5 };

        try {
            // Convert Current
            d.temperature = convertTemp(weatherData_v5.temperature);
            d.feelsLike = convertTemp(weatherData_v5.feelsLike);
            d.windSpeed = convertWind(weatherData_v5.windSpeed);
            d.pressure = convertPressure(weatherData_v5.pressure);
            d.visibility = convertDist(weatherData_v5.visibility);
            d.precipitation = convertPrecip(weatherData_v5.precipitation);
            d.dewPoint = convertTemp(weatherData_v5.dewPoint);

            // Convert Hourly
            if (d.hourly) {
                d.hourly = { ...d.hourly }; // shallow copy
                d.hourly.temperature_2m = d.hourly.temperature_2m.map(t => convertTemp(t));
                if (d.hourly.precipitation) d.hourly.precipitation = d.hourly.precipitation.map(p => convertPrecip(p));
                if (d.hourly.wind_speed_10m) d.hourly.wind_speed_10m = d.hourly.wind_speed_10m.map(w => convertWind(w));
                if (d.hourly.pressure_msl) d.hourly.pressure_msl = d.hourly.pressure_msl.map(p => convertPressure(p));
            }

            // Convert Daily
            if (d.daily) {
                d.daily = { ...d.daily };
                d.daily.temperature_2m_max = d.daily.temperature_2m_max.map(t => convertTemp(t));
                d.daily.temperature_2m_min = d.daily.temperature_2m_min.map(t => convertTemp(t));
            }
        } catch (e) {
            console.error("Data conversion error:", e);
        }

        // Filter Pollen based on Health Settings
        if (d.pollen && settings.health?.pollen) {
            const filteredPollen = {};
            if (settings.health.pollen.tree) filteredPollen.tree = d.pollen.tree;
            if (settings.health.pollen.grass) filteredPollen.grass = d.pollen.grass;
            if (settings.health.pollen.ragweed) filteredPollen.ragweed = d.pollen.ragweed;

            d.pollen = filteredPollen;
        }

        // Filter Activity Highlights based on Profiles
        if (d.activityScores && settings.health?.activity) {
            const profiles = {
                default: ['running', 'basketball', 'cycling'],
                running: ['running', 'cycling', 'hiking'],
                basketball: ['basketball', 'running', 'cycling'],
                cycling: ['cycling', 'running', 'hiking'],
                boating: ['boating', 'fishing', 'stargazing'],
                gardening: ['gardening', 'yoga', 'stargazing'],
                hiking: ['hiking', 'running', 'stargazing'],
                fishing: ['fishing', 'boating', 'hiking'],
                yoga: ['yoga', 'gardening', 'stargazing'],
                stargazing: ['stargazing', 'boating', 'fishing']
            };

            const activeProfile = settings.health.activity || 'default';
            const activeKeys = profiles[activeProfile] || profiles.default;

            const filteredScores = {};
            // Ensure we strictly iterate in the order of activeKeys to maintain display order
            activeKeys.forEach(key => {
                if (d.activityScores[key] !== undefined) {
                    filteredScores[key] = d.activityScores[key];
                }
            });
            d.activityScores = filteredScores;
        }

        return d;
    };

    const displayData = getDisplayData();
    const unitLabels = {
        temp: settings.units.temp === 'c' ? '°C' : settings.units.temp === 'f' ? '°F' : 'K',
        wind: settings.units.wind === 'kmh' ? 'km/h' : settings.units.wind === 'mph' ? 'mph' : settings.units.wind === 'ms' ? 'm/s' : settings.units.wind,
        precip: settings.units.precip,
        pressure: settings.units.pressure === 'inhg' ? 'inHg' : settings.units.pressure === 'kpa' ? 'kPa' : 'hPa',
        distance: settings.units.distance,
        time: settings.units.time
    };

    const renderDashboard = () => (
        <div className="dashboard-grid animate-fade-in" style={{ height: '100%', overflow: 'hidden' }}>
            <div className="left-section" style={{ overflowY: 'auto', paddingRight: '10px' }}>
                <Weather weatherData={displayData} isLoading={isLoading} units={unitLabels} />
                <HourlyForecast weatherData={displayData} getIcon={getIcon} units={unitLabels} />
                <DailyForecastList weatherData={displayData} getIcon={getIcon} units={unitLabels} />
            </div>

            <div className="right-section" style={{ overflowY: 'auto', paddingRight: '10px' }}>
                <Highlights weatherData={displayData} isLoading={isLoading} units={unitLabels} />
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'chart': return <ChartPage weatherData={displayData} units={unitLabels} />;
            case 'map': return <MapPage weatherData={displayData} />;
            case 'calendar': return <CalendarPage weatherData={displayData} getIcon={getIcon} units={unitLabels} />;
            case 'settings': return <SettingsPage onLogout={handleLogout} userName={userName} userProfile={userProfile} openProfile={openProfile} settings={settings} setSettings={setSettings} initialSection={settingsStartSection} />;
            case 'help': return <HelpPage />;
            case 'profile': return <ProfilePage userProfile={userProfile} onSaveProfile={handleSaveProfile} startEditing={profileEditMode} onBack={() => { setSettingsStartSection('account'); setActiveTab('settings'); }} />;
            default: return renderDashboard();
        }
    };

    const handleSaveProfile = async (newProfile) => {
        setUserProfile(newProfile);
        setUserName(newProfile.fullName || userName);
        localStorage.setItem('userProfile', JSON.stringify(newProfile));

        try {
            const api = await import('../services/api');
            await api.updateProfile(newProfile);
        } catch (e) {
            console.error("Failed to update profile on server", e);
        }
    };

    const openProfile = (shouldEdit = false) => {
        setProfileEditMode(shouldEdit);
        setActiveTab('profile');
    };

    return (
        <div className="dashboard-container">
            {displayData && settings.appearance.dynamicBg && (
                <BackgroundManager
                    weatherCode={displayData.weatherCode}
                    isDay={displayData.isDay}
                />
            )}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="main-content">
                <Header
                    userName={userName}
                    onSearch={search}
                    openProfile={openProfile}
                    onLogout={handleLogout}
                    onLocationClick={handleGeolocation}
                />

                <div className="content-wrapper">
                    {renderContent()}
                </div>
            </div>


        </div>
    );
};

export default Dashboard;
