import React, { useState, useMemo } from 'react';

const ChartPage = ({ weatherData, units }) => {
    // Metrics: 'temp', 'precip', 'wind', 'pressure', 'uv'
    const [selectedMetric, setSelectedMetric] = useState('temp');
    const [timeScale, setTimeScale] = useState('24h'); // '24h' or '48h'

    if (!weatherData) return <div className="glass-card">No data available</div>;

    // --- Data Preparation ---
    const chartData = useMemo(() => {
        const hourly = weatherData.hourly;
        if (!hourly) return [];

        // Determine slice range
        const now = new Date();
        const startIdx = hourly.time.findIndex(t => new Date(t).getHours() === now.getHours());
        const count = timeScale === '24h' ? 24 : 48;
        const validStart = startIdx === -1 ? 0 : startIdx;
        const sliceEnd = Math.min(validStart + count, hourly.time.length);

        const getMinMax = (data, pMin = 0, pMax = 100, buffer = 0) => {
            if (!data || data.length === 0) return { min: pMin, max: pMax };
            const validData = data.filter(n => typeof n === 'number' && !isNaN(n));
            if (validData.length === 0) return { min: pMin, max: pMax };
            const min = Math.min(...validData);
            const max = Math.max(...validData);
            return { min: min - buffer, max: max + buffer };
        };

        const tStats = getMinMax(hourly.temperature_2m || [], 0, 40, 5);
        const pStats = getMinMax(hourly.precipitation || [], 0, 10, 0); // Logic handled in object for max * 1.5
        const wStats = getMinMax(hourly.wind_speed_10m || [], 0, 30, 10);
        const prStats = getMinMax(hourly.pressure_msl || [], 980, 1020, 2);
        const hStats = getMinMax(hourly.relative_humidity_2m || [], 0, 100, 0);

        const dataParams = {
            temp: {
                key: 'temperature_2m',
                label: `Temperature (${units?.temp || '°C'})`,
                type: 'line',
                color: '#f97316',
                min: tStats.min,
                max: tStats.max
            },
            precip: {
                key: 'precipitation',
                label: `Precipitation (${units?.precip || 'mm'})`,
                type: 'bar',
                color: '#3b82f6',
                min: 0,
                max: Math.max(pStats.max, 1) * 1.5
            },
            wind: {
                key: 'wind_speed_10m',
                label: `Wind Speed (${units?.wind || 'km/h'})`,
                type: 'line',
                color: '#10b981',
                min: 0,
                max: wStats.max
            },
            pressure: {
                key: 'pressure_msl',
                label: `Pressure (${units?.pressure || 'hPa'})`,
                type: 'line',
                color: '#8b5cf6',
                min: prStats.min,
                max: prStats.max
            },
            uv: {
                key: 'relative_humidity_2m',
                label: 'Humidity (%)',
                type: 'line',
                color: '#06b6d4',
                min: 0,
                max: 100
            }
        };

        const config = dataParams[selectedMetric] || dataParams.temp;
        const sourceData = hourly[config.key] || [];
        const slicedTimes = hourly.time.slice(validStart, sliceEnd);
        const slicedValues = sourceData.slice(validStart, sliceEnd);

        return slicedTimes.map((t, i) => ({
            time: new Date(t).toLocaleTimeString([], { hour: 'numeric', hour12: units?.time !== '24h' }),
            value: (typeof slicedValues[i] === 'number' && !isNaN(slicedValues[i])) ? slicedValues[i] : 0,
            config
        }));

    }, [weatherData, selectedMetric, timeScale, units]);

    // --- Chart Dimensions ---
    const width = 800;
    const height = 300;
    const padding = 40;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    if (chartData.length === 0) return null;
    const config = chartData[0].config;

    // Scale Helpers
    const minVal = config.min;
    const maxVal = config.max;
    const range = maxVal - minVal;

    const getX = (i) => {
        const den = chartData.length > 1 ? chartData.length - 1 : 1;
        return padding + (i / den) * chartW;
    };
    const getY = (val) => height - padding - ((val - minVal) / (range || 1)) * chartH;

    // Generate Path for Line Chart
    const linePath = useMemo(() => {
        if (config.type !== 'line') return '';
        return chartData.map((d, i) =>
            `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`
        ).join(' ');
    }, [chartData, config]);

    // Generate Gradient Area
    const areaPath = useMemo(() => {
        if (config.type !== 'line') return '';
        return `${linePath} L ${getX(chartData.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`;
    }, [linePath]);

    const metrics = [
        { id: 'temp', label: 'Temperature' },
        { id: 'precip', label: 'Precipitation' },
        { id: 'wind', label: 'Wind' },
        { id: 'pressure', label: 'Pressure' },
        { id: 'uv', label: 'Humidity' }
    ];

    return (
        <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                    {metrics.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedMetric(m.id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                background: selectedMetric === m.id ? 'var(--accent-primary)' : 'transparent',
                                color: selectedMetric === m.id ? 'white' : 'var(--text-primary)',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                transition: 'all 0.3s'
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                <div className="glass-card" style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setTimeScale('24h')}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: timeScale === '24h' ? 'var(--bg-secondary)' : 'transparent', color: 'white', cursor: 'pointer' }}
                    >24 Hours</button>
                    <button
                        onClick={() => setTimeScale('48h')}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: timeScale === '48h' ? 'var(--bg-secondary)' : 'transparent', color: 'white', cursor: 'pointer' }}
                    >48 Hours</button>
                </div>
            </div>

            <div className="glass-card" style={{ flex: 1, padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>{config.label} Trend</h3>

                <div style={{ flex: 1, width: '100%', minHeight: '0' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        {/* Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                            const y = height - padding - (pct * chartH);
                            return (
                                <g key={pct}>
                                    <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4 4" />
                                    <text x={padding - 10} y={y + 5} textAnchor="end" fill="var(--text-secondary)" fontSize="12">
                                        {isNaN(minVal) ? '-' : Math.round(minVal + (pct * range))}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Chart Content */}
                        {config.type === 'line' ? (
                            <>
                                <defs>
                                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={config.color} stopOpacity="0.3" />
                                        <stop offset="100%" stopColor={config.color} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={areaPath} fill="url(#chartFill)" />
                                <path d={linePath} fill="none" stroke={config.color} strokeWidth="3" strokeLinecap="round" />
                                {chartData.map((d, i) => (
                                    (i % 4 === 0) && <circle key={i} cx={getX(i)} cy={getY(d.value)} r="4" fill="var(--bg-primary)" stroke={config.color} strokeWidth="2" />
                                ))}
                            </>
                        ) : (
                            // Bar Chart logic
                            chartData.map((d, i) => {
                                const barH = !isNaN(d.value) && !isNaN(minVal) && !isNaN(range)
                                    ? ((d.value - minVal) / (range || 1)) * chartH
                                    : 0;
                                const yPos = isNaN(getY(d.value)) ? height - padding : getY(d.value);
                                return (
                                    <rect
                                        key={i}
                                        x={getX(i) - 4}
                                        y={yPos}
                                        width="8"
                                        height={Math.max(barH, 0)}
                                        fill={config.color}
                                        rx="2"
                                    />
                                );
                            })
                        )}

                        {/* X Axis Labels */}
                        {chartData.map((d, i) => {
                            const step = timeScale === '24h' ? 4 : 8;
                            if (i % step !== 0) return null;
                            return (
                                <text key={i} x={getX(i)} y={height - 10} textAnchor="middle" fill="var(--text-secondary)" fontSize="12">
                                    {d.time}
                                </text>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default ChartPage;
