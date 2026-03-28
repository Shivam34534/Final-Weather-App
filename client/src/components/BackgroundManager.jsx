import React, { useEffect, useState } from 'react';
import './BackgroundManager.css';

const BackgroundManager = ({ weatherCode, isDay = 1 }) => {
    const [bgClass, setBgClass] = useState('bg-clear-day');

    useEffect(() => {
        // Map WMO codes to background types
        if ([0, 1].includes(weatherCode)) {
            setBgClass(isDay ? 'bg-clear-day' : 'bg-clear-night');
        } else if ([2, 3, 45, 48].includes(weatherCode)) {
            setBgClass(isDay ? 'bg-cloudy-day' : 'bg-cloudy-night');
        } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
            setBgClass(isDay ? 'bg-rain-day' : 'bg-rain-night');
        } else if ([95, 96, 99].includes(weatherCode)) {
            setBgClass(isDay ? 'bg-storm-day' : 'bg-storm-night');
        } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
            setBgClass(isDay ? 'bg-snow-day' : 'bg-snow-night');
        } else {
            setBgClass(isDay ? 'bg-clear-day' : 'bg-clear-night');
        }
    }, [weatherCode, isDay]);

    return (
        <div className={`dynamic-bg ${bgClass}`}>
            {bgClass.includes('cloud') && <div className="cloud-layer" />}
            {bgClass.includes('rain') && <div className="rain-layer" />}
            {bgClass.includes('snow') && <div className="snow-layer" />}
            {bgClass.includes('storm') && <div className="storm-flash" />}
            {/* Stars for clear night */}
            {bgClass === 'bg-clear-night' && <div className="stars-layer" />}
        </div>
    );
};

export default BackgroundManager;
