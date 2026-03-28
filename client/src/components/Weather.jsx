import React from 'react'

const Weather = ({ weatherData, isLoading, units }) => {
    if (isLoading) {
        return (
            <div className="glass-card weather-main-card skeleton">
                <div className="skeleton-line" style={{ width: '40%', height: '30px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <div className="skeleton-line" style={{ width: '50%', height: '80px' }}></div>
                    <div className="skeleton-line" style={{ width: '30%', height: '80px' }}></div>
                </div>
            </div>
        )
    }

    if (!weatherData) return null;

    const date = new Date();
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    // Helper to get condition text
    const getConditionText = (code) => {
        if (code === 0) return "Clear Sky";
        if (code === 1) return "Mainly Clear";
        if (code === 2) return "Partly Cloudy";
        if (code === 3) return "Overcast";
        if (code >= 45 && code <= 48) return "Foggy";
        if (code >= 51 && code <= 55) return "Drizzle";
        if (code >= 56 && code <= 57) return "Freezing Drizzle";
        if (code >= 61 && code <= 65) return "Rain";
        if (code >= 66 && code <= 67) return "Freezing Rain";
        if (code >= 71 && code <= 77) return "Snow";
        if (code >= 80 && code <= 82) return "Rain Showers";
        if (code >= 85 && code <= 86) return "Snow Showers";
        if (code >= 95) return "Thunderstorm";
        return "Variable";
    };

    // Use daily data for accurate High/Low if available, else fallback
    const highTemp = weatherData.daily?.temperature_2m_max?.[0] ?? Math.round(weatherData.temperature + 4);
    const lowTemp = weatherData.daily?.temperature_2m_min?.[0] ?? Math.round(weatherData.temperature - 3);

    return (
        <div className="glass-card weather-main-card">
            <div className="card-top">
                <div className="location-badge">
                    <span className="icon">📍</span>
                    <span className="text">{weatherData.location}</span>
                </div>
                <div className="date-badge">{dateStr}</div>
            </div>

            <div className="weather-content">
                <div className="temp-section">
                    <div className="main-temp">
                        {weatherData.temperature}<span>{units?.temp || '°'}</span>
                    </div>
                    <div className="condition-text">
                        {getConditionText(weatherData.weatherCode)}
                    </div>
                    <div className="feels-like">
                        Feels like {weatherData.feelsLike}°
                    </div>

                    {weatherData.summary && (
                        <div style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: '1.4' }}>
                            {weatherData.summary}
                        </div>
                    )}
                </div>

                <div className="visual-section" style={{ position: 'relative' }}>
                    <img src={weatherData.icon} alt="weather icon" className="floating-icon" />
                    {weatherData.nowcast ? (
                        <div className="precip-badge" style={{ marginTop: '1rem', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            ☂️ {weatherData.nowcast}
                        </div>
                    ) : (weatherData.precipitation > 0 && (
                        <div className="precip-badge">
                            🌧️ {weatherData.precipitation}{units?.precip || 'mm'} Now
                        </div>
                    ))}
                </div>
            </div>

            <div className="weather-footer">
                <div className="stat">
                    <span className="label">Low / High</span>
                    <span className="val">{Math.round(lowTemp)}° / {Math.round(highTemp)}°</span>
                </div>
                {weatherData.sunrise && (
                    <div className="stat">
                        <span className="label">Sun</span>
                        <div className="val" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <img src="https://basmilius.github.io/weather-icons/production/fill/all/sunrise.svg" alt="sunrise" style={{ width: '24px', height: '24px' }} />
                                {new Date(weatherData.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: units?.time === '12h' })}
                            </div>
                            <span style={{ opacity: 0.3 }}>|</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <img src="https://basmilius.github.io/weather-icons/production/fill/all/sunset.svg" alt="sunset" style={{ width: '24px', height: '24px' }} />
                                {new Date(weatherData.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: units?.time === '12h' })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .weather-main-card {
                    padding: 2.5rem;
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
                }
                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .location-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--glass-bg);
                    padding: 6px 16px;
                    border-radius: 30px;
                    border: 1px solid var(--glass-border);
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .date-badge {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .weather-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 2rem 0;
                }
                .temp-section {
                    display: flex;
                    flex-direction: column;
                }
                .main-temp {
                    font-size: 6rem;
                    font-weight: 800;
                    line-height: 1;
                    display: flex;
                    align-items: flex-start;
                    background: linear-gradient(180deg, #fff, rgba(255,255,255,0.7));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .main-temp span {
                    font-size: 3rem;
                    margin-top: 0.5rem;
                    color: var(--accent-primary);
                    -webkit-text-fill-color: var(--accent-primary);
                }
                .condition-text {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-top: 5px;
                }
                .feels-like {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    margin-top: 4px;
                }
                .visual-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .floating-icon {
                    width: 160px;
                    filter: drop-shadow(0 0 30px rgba(59, 130, 246, 0.4));
                    animation: float 4s ease-in-out infinite;
                }
                .precip-badge {
                    background: rgba(59, 130, 246, 0.2);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-top: -10px;
                    backdrop-filter: blur(4px);
                }
                .weather-footer {
                    display: flex;
                    gap: 3rem;
                    margin-top: 1rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--glass-border);
                }
                .stat {
                    display: flex;
                    flex-direction: column;
                }
                .stat .label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .stat .val {
                    font-size: 1.2rem;
                    font-weight: 700;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .skeleton-line {
                    background: var(--glass-bg);
                    border-radius: 4px;
                    animation: pulse 1.5s infinite;
                }
            `}} />
        </div>
    )
}

export default Weather
