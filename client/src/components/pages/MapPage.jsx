import React, { useState } from 'react';

const MapPage = ({ weatherData }) => {
    const [layer, setLayer] = useState('radar'); // radar, wind, clouds, temperature

    if (!weatherData) return <div className="glass-card">Loading Map...</div>;

    const lat = parseFloat(weatherData.latitude) || 40.7128;
    const lon = parseFloat(weatherData.longitude) || -74.0060;

    const layers = [
        { id: 'radar', label: 'Precipitation Radar', icon: '⛈️' },
        { id: 'wind', label: 'Wind Streamlines', icon: '💨' },
        { id: 'clouds', label: 'Cloud Cover', icon: '☁️' },
        { id: 'temperature', label: 'Temperature Heatmap', icon: '🌡️' }
    ];

    // Windy Embed URL
    // product: radar, wind, clouds, rain, temp
    const getEmbedUrl = (l) => {
        // Map our layer ID to Windy product ID
        const productMap = {
            radar: 'radar',
            wind: 'wind',
            clouds: 'clouds',
            temperature: 'temp' // windy uses 'temp'
        };
        const product = productMap[l] || 'radar';

        return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=11&level=surface&overlay=${product}&product=${product}&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;
    };

    return (
        <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, margin: 0 }}>Interactive Map</h2>

                <div className="glass-card" style={{ padding: '6px', display: 'flex', gap: '8px' }}>
                    {layers.map(l => (
                        <button
                            key={l.id}
                            onClick={() => setLayer(l.id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: layer === l.id ? 'var(--accent-primary)' : 'transparent',
                                color: layer === l.id ? 'white' : 'var(--text-secondary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s'
                            }}
                        >
                            <span>{l.icon}</span>
                            {l.label.split(' ')[0]} {/* Short label for space */}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-card" style={{ flex: 1, padding: '0', overflow: 'hidden', position: 'relative', borderRadius: '16px' }}>
                <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl(layer)}
                    frameBorder="0"
                    style={{ display: 'block' }}
                    allow="geolocation"
                ></iframe>

                {/* Overlay Credits */}
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
                        Data via Windy.com
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MapPage;
