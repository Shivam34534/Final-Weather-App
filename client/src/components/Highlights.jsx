import React from 'react';
import humidityIcon from '../assets/humidity.png';
import windIcon from '../assets/wind.png';
import rainIcon from '../assets/rain.png';
import clearIcon from '../assets/clear.png';
import cloudIcon from '../assets/cloud.png';

const ModuleCard = ({ title, children, style = {} }) => (
    <div className="glass-card highlight-card animate-fade-in" style={{ ...style, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
            {title}
        </div>
        {children}
    </div>
);

const Highlights = ({ weatherData, isLoading, units }) => {
    if (isLoading || !weatherData) {
        return <div className="highlights-grid skeleton-grid">Loading...</div>;
    }

    return (
        <div className="highlights-section">
            <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Command Center</h3>

            <div className="highlights-grid">

                {/* 1. Air Quality Module */}
                <ModuleCard title="Air Quality" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                            <span style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1 }}>{weatherData.aqi || '--'}</span>
                            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '8px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>US AQI</span>
                        </div>
                        <div style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            background: weatherData.aqi <= 50 ? '#22c55e' : weatherData.aqi <= 100 ? '#eab308' : '#ef4444',
                            color: '#000000',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        }}>
                            {weatherData.aqi <= 50 ? 'Good' : weatherData.aqi <= 100 ? 'Moderate' : 'Unhealthy'}
                        </div>
                    </div>

                    {weatherData.pollutants && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                            {Object.entries(weatherData.pollutants).map(([key, val]) => (
                                <div key={key} style={{ padding: '12px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{val ? Math.round(val) : '-'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </ModuleCard>

                {/* 2. Sun & UV Module */}
                <ModuleCard title="Sun & UV">
                    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ position: 'absolute', top: '0', right: '0', opacity: 0.15 }}>
                            <img src="https://basmilius.github.io/weather-icons/production/fill/all/uv-index.svg" alt="uv icon" style={{ width: '80px', height: '80px' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, marginBottom: '4px' }}>{weatherData.uvIndex}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>UV Index</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', color: '#f97316', fontWeight: 700, marginBottom: '4px' }}>Burn Time</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{weatherData.burnTime || 'N/A'}</div>
                            </div>
                        </div>
                        <div style={{ position: 'relative', marginTop: '1.5rem', width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                            <div style={{
                                width: `${Math.min(weatherData.uvIndex * 10, 100)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #facc15, #f97316, #ef4444)',
                                borderRadius: '10px',
                                transition: 'width 1s ease-out'
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                left: `${Math.min(weatherData.uvIndex * 10, 100)}%`,
                                top: '-4px',
                                width: '16px',
                                height: '16px',
                                background: '#fff',
                                borderRadius: '50%',
                                boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)',
                            }}></div>
                        </div>
                    </div>
                </ModuleCard>

                {/* 3. Wind Compass (SVG Visual) */}
                <ModuleCard title="Wind">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 10px' }}>
                        {/* SVG Compass */}
                        <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: `rotate(${weatherData.windDirection}deg)`, transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                                {/* Compass Circle */}
                                <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                                {/* Ticks */}
                                <line x1="50" y1="5" x2="50" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                <line x1="95" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                <line x1="50" y1="95" x2="50" y2="90" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                <line x1="5" y1="50" x2="10" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                {/* Needle */}
                                <path d="M50 20 L55 50 L50 80 L45 50 Z" fill="var(--accent-primary)" />
                                <circle cx="50" cy="50" r="3" fill="#fff" />
                            </svg>
                            {/* Direction Letters (Static) */}
                            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <span style={{ position: 'absolute', top: '2px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>N</span>
                                <span style={{ position: 'absolute', bottom: '2px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>S</span>
                                <span style={{ position: 'absolute', left: '2px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>W</span>
                                <span style={{ position: 'absolute', right: '2px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>E</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{weatherData.windSpeed}</div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{units?.wind || 'km/h'}</div>
                        </div>
                    </div>
                </ModuleCard>

                {/* 4. Lifestyle / Activity Scores */}
                <ModuleCard title="Activity Scores" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {weatherData.activityScores && Object.entries(weatherData.activityScores).map(([activity, score]) => (
                            <div key={activity} style={{ background: 'var(--glass-bg)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
                                    {activity === 'running' && '🏃'}
                                    {activity === 'golf' && '⛳'}
                                    {activity === 'boating' && '⛵'}
                                    {activity === 'cycling' && '🚴'}
                                    {activity === 'hiking' && '🥾'}
                                    {activity === 'fishing' && '🎣'}
                                    {activity === 'tennis' && '🎾'}
                                    {activity === 'yoga' && '🧘'}
                                    {activity === 'stargazing' && '✨'}
                                    {activity === 'basketball' && '🏀'}
                                    {activity === 'gardening' && '🌻'}
                                </div>
                                <div style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.9rem' }}>{activity}</div>
                                <div style={{
                                    marginTop: '5px', height: '4px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${score * 10}%`, height: '100%',
                                        background: score >= 8 ? '#22c55e' : score >= 5 ? '#eab308' : '#ef4444'
                                    }}></div>
                                </div>
                                <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.8 }}>{score}/10</div>
                            </div>
                        ))}
                    </div>
                </ModuleCard>

                {/* 5. Pollen Tracker */}
                <ModuleCard title="Pollen Levels">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {weatherData.pollen && Object.entries(weatherData.pollen).map(([type, level]) => (
                            <div key={type} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', width: '100%', fontSize: '0.9rem' }}>
                                <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>
                                        {type === 'tree' && '🌲'}
                                        {type === 'grass' && '🌾'}
                                        {type === 'ragweed' && '🌿'}
                                    </span>
                                    {type}
                                </span>
                                <span style={{ fontWeight: 600, color: level === 'High' ? '#ef4444' : level === 'Moderate' ? '#eab308' : '#22c55e' }}>{level}</span>
                            </div>
                        ))}
                    </div>
                </ModuleCard>

                {/* 6. Standard Humidity (SVG Visual) */}
                <ModuleCard title="Humidity">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 1rem' }}>
                        {/* Wavy Lines SVG */}
                        <div style={{ width: '50px', height: '50px', color: 'white' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3v18" style={{ opacity: 0 }} /> {/* Spacer */}
                                <path d="M2.5 10c1.5 0 2 1.5 3.5 1.5s2-1.5 3.5-1.5 2 1.5 3.5 1.5 2-1.5 3.5-1.5 2 1.5 3.5 1.5" />
                                <path d="M2.5 15c1.5 0 2 1.5 3.5 1.5s2-1.5 3.5-1.5 2 1.5 3.5 1.5 2-1.5 3.5-1.5 2 1.5 3.5 1.5" />
                                <path d="M2.5 5c1.5 0 2 1.5 3.5 1.5s2-1.5 3.5-1.5 2 1.5 3.5 1.5 2-1.5 3.5-1.5 2 1.5 3.5 1.5" style={{ opacity: 0.5 }} />
                            </svg>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{weatherData.humidity}%</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Dew Point: {weatherData.dewPoint}{units?.temp || '°'}</div>
                        </div>
                    </div>
                </ModuleCard>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .highlights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                }
                @media (max-width: 768px) {
                    .highlights-grid {
                        grid-template-columns: 1fr;
                    }
                    .highlights-grid > div {
                        grid-column: span 1 !important;
                    }
                }
            `}} />
        </div>
    );
};

export default Highlights;
