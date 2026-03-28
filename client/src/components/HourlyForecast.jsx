import React, { useRef, useEffect } from 'react';

const HourlyForecast = ({ weatherData, getIcon, units }) => {
    const scrollRef = useRef(null);

    // Calculate start index for hourly forecast based on current time
    const currentHour = new Date().getHours();

    let startIndex = 0;
    if (weatherData?.hourly?.time) {
        const now = new Date();
        startIndex = weatherData.hourly.time.findIndex(t => {
            const d = new Date(t);
            return d.getDate() === now.getDate() && d.getHours() >= currentHour;
        });
        if (startIndex === -1) startIndex = 0;
    }

    // Get next 24 hours
    const hourlyData = weatherData?.hourly?.time?.slice(startIndex, startIndex + 25) || [];

    // Optional: Auto-scroll to beginning if needed, but since we slice, it starts at 0.

    return (
        <div className="glass-card forecast-card">
            <div className="card-header">
                <h3>Hourly Forecast</h3>
            </div>
            <div className="forecast-scroll" ref={scrollRef}>
                {hourlyData.map((time, i) => {
                    const realIndex = startIndex + i;
                    const isNow = i === 0;
                    const d = new Date(time);
                    const h = d.getHours();
                    const isDay = h >= 6 && h < 20;

                    return (
                        <div
                            key={i}
                            className="forecast-item"
                            style={isNow ? {
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                                borderColor: 'var(--accent-primary)',
                                boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
                                minWidth: '100px'
                            } : {}}
                        >
                            <span className="time" style={{ fontWeight: isNow ? 700 : 400 }}>
                                {isNow ? 'Now' : d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: units?.time !== '24h' })}
                            </span>
                            <img
                                src={getIcon(weatherData.hourly.weather_code[realIndex], isDay ? 1 : 0)}
                                alt="weather"
                                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                            />
                            <span className="temp">{Math.round(weatherData.hourly.temperature_2m[realIndex])}{units?.temp || '°'}</span>

                            {/* Simple pop chance if available, else hidden */}
                            {weatherData.hourly.precipitation_probability && (
                                <span style={{ fontSize: '0.7rem', color: '#60a5fa' }}>
                                    {weatherData.hourly.precipitation_probability[realIndex]}%
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HourlyForecast;
