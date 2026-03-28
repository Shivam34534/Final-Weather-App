import React from 'react';

const DailyForecastList = ({ weatherData, units, getIcon }) => {
    if (!weatherData || !weatherData.daily) return null;

    const { time, temperature_2m_max, temperature_2m_min, precipitation_probability_max, weather_code } = weatherData.daily;

    const minTempWeek = Math.min(...temperature_2m_min);
    const maxTempWeek = Math.max(...temperature_2m_max);

    return (
        <div className="glass-card" style={{ padding: '20px', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>7-Day Forecast</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {time.map((t, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.2)', // Darker for contrast
                        borderRadius: '12px',
                        transition: '0.2s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                            <div style={{ width: '40px', fontWeight: 600, color: i === 0 ? 'var(--accent-primary)' : 'inherit' }}>
                                {i === 0 ? 'Today' : new Date(t).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>

                            <img
                                src={getIcon ? getIcon(weather_code[i], 1) : ''}
                                alt=""
                                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                            />

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.9rem' }}>
                                    {precipitation_probability_max[i] > 20 ? `${precipitation_probability_max[i]}% Rain` : 'Clear'}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                            <span style={{ color: '#cbd5e1', width: '30px', textAlign: 'right', fontSize: '0.9rem' }}>{Math.round(temperature_2m_min[i])}°</span>

                            {/* Temperature Range Bar */}
                            <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: `${((temperature_2m_min[i] - minTempWeek) / (maxTempWeek - minTempWeek)) * 100}%`,
                                    right: `${100 - ((temperature_2m_max[i] - minTempWeek) / (maxTempWeek - minTempWeek)) * 100}%`,
                                    top: 0, bottom: 0,
                                    background: 'linear-gradient(90deg, #60a5fa, #f97316)',
                                    borderRadius: '2px'
                                }}></div>
                            </div>

                            <span style={{ color: 'white', width: '30px', textAlign: 'left', fontWeight: 600, fontSize: '0.9rem' }}>{Math.round(temperature_2m_max[i])}°</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyForecastList;
