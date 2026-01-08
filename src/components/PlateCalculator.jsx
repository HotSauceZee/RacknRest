import React, { useState, useEffect } from 'react';

const INITIAL_KG_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const INITIAL_LB_PLATES = [45, 35, 25, 10, 5, 2.5];

const PlateCalculator = () => {
    // Load settings from localStorage
    const savedUnit = localStorage.getItem('gym-unit') || 'lb';
    const savedKgPlates = JSON.parse(localStorage.getItem('gym-kg-plates')) || INITIAL_KG_PLATES;
    const savedLbPlates = JSON.parse(localStorage.getItem('gym-lb-plates')) || INITIAL_LB_PLATES;

    const [unit, setUnit] = useState(savedUnit);
    const [barWeight, setBarWeight] = useState(savedUnit === 'kg' ? 20 : 45);
    const [targetWeight, setTargetWeight] = useState(savedUnit === 'kg' ? 60 : 135);
    const [plates, setPlates] = useState([]);
    const [activeKgPlates, setActiveKgPlates] = useState(savedKgPlates);
    const [activeLbPlates, setActiveLbPlates] = useState(savedLbPlates);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        localStorage.setItem('gym-unit', unit);
    }, [unit]);

    useEffect(() => {
        localStorage.setItem('gym-kg-plates', JSON.stringify(activeKgPlates));
    }, [activeKgPlates]);

    useEffect(() => {
        localStorage.setItem('gym-lb-plates', JSON.stringify(activeLbPlates));
    }, [activeLbPlates]);

    useEffect(() => {
        calculatePlates();
    }, [targetWeight, barWeight, unit, activeKgPlates, activeLbPlates]);

    const calculatePlates = () => {
        let weightPerSide = (targetWeight - barWeight) / 2;
        if (weightPerSide < 0) {
            setPlates([]);
            return;
        }

        const availablePlates = unit === 'kg' ? activeKgPlates : activeLbPlates;
        // Sort descending to ensure greedy works correctly
        const sortedPlates = [...availablePlates].sort((a, b) => b - a);

        const result = [];
        let remaining = weightPerSide;

        for (let plate of sortedPlates) {
            while (remaining >= plate) {
                result.push(plate);
                remaining = Math.round((remaining - plate) * 100) / 100; // Fix floating point
            }
        }
        setPlates(result);
    };

    const togglePlate = (plate) => {
        if (unit === 'kg') {
            setActiveKgPlates(prev =>
                prev.includes(plate) ? prev.filter(p => p !== plate) : [...prev, plate]
            );
        } else {
            setActiveLbPlates(prev =>
                prev.includes(plate) ? prev.filter(p => p !== plate) : [...prev, plate]
            );
        }
    };

    return (
        <div className="fade-in">
            <div className="card">
                <div className="input-group">
                    <label className="input-label">Target Weight ({unit})</label>
                    <input
                        type="number"
                        value={targetWeight || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            setTargetWeight(val === '' ? 0 : Number(val));
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                    />
                </div>

                <div className="grid-2">
                    <div className="input-group">
                        <label className="input-label">Bar Weight</label>
                        <select
                            value={barWeight}
                            onChange={(e) => setBarWeight(Number(e.target.value))}
                            style={{ width: '100%', padding: '1rem', background: '#1a1a1a', border: '1px solid #222', borderRadius: '1rem', color: 'white', fontSize: '1.2rem', fontWeight: '700' }}
                        >
                            {unit === 'kg' ? (
                                <>
                                    <option value={20}>20 kg (Standard)</option>
                                    <option value={15}>15 kg (Ladies)</option>
                                    <option value={10}>10 kg (Technique)</option>
                                    <option value={0}>0 kg (No bar)</option>
                                </>
                            ) : (
                                <>
                                    <option value={45}>45 lb (Standard)</option>
                                    <option value={35}>35 lb (Ladies)</option>
                                    <option value={0}>0 lb (No bar)</option>
                                </>
                            )}
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Unit</label>
                        <button
                            className="btn btn-outline"
                            onClick={() => {
                                const newUnit = unit === 'kg' ? 'lb' : 'kg';
                                setUnit(newUnit);
                                setBarWeight(newUnit === 'kg' ? 20 : 45);
                                setTargetWeight(newUnit === 'kg' ? 60 : 135);
                            }}
                        >
                            {unit.toUpperCase()}
                        </button>
                    </div>
                </div>

                <button
                    className="btn btn-ghost"
                    style={{ fontSize: '0.8rem', marginTop: '-0.5rem' }}
                    onClick={() => setShowSettings(!showSettings)}
                >
                    {showSettings ? 'Hide' : 'Customize'} Available Plates
                </button>

                {showSettings && (
                    <div className="fade-in" style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {(unit === 'kg' ? INITIAL_KG_PLATES : INITIAL_LB_PLATES).map(p => (
                            <button
                                key={p}
                                className={`btn btn-outline ${(unit === 'kg' ? activeKgPlates : activeLbPlates).includes(p) ? 'active' : ''}`}
                                style={{
                                    flex: '1 0 30%',
                                    fontSize: '0.9rem',
                                    padding: '0.5rem',
                                    background: (unit === 'kg' ? activeKgPlates : activeLbPlates).includes(p) ? 'var(--accent)' : 'transparent',
                                    color: (unit === 'kg' ? activeKgPlates : activeLbPlates).includes(p) ? 'black' : 'white'
                                }}
                                onClick={() => togglePlate(p)}
                            >
                                {p}{unit}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="card" style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Plates per side</h3>

                <div style={{ position: 'relative', width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginLeft: '50px' }}>
                    {/* Bar sleeve */}
                    <div style={{ width: '150px', height: '12px', background: '#333', borderRadius: '2px', position: 'relative', zIndex: 1 }}>
                        {/* Center mark for alignment */}
                    </div>

                    {/* Plates container - centered on the bar sleeve */}
                    <div style={{ position: 'absolute', left: '10px', display: 'flex', gap: '3px', flexDirection: 'row-reverse', alignItems: 'center', zIndex: 2 }}>
                        {plates.map((p, i) => {
                            const height = unit === 'kg' ? (p * 2 + 30) : (p * 1.5 + 30);
                            return (
                                <div
                                    key={i}
                                    style={{
                                        width: '14px',
                                        height: `${height}px`,
                                        background: p >= 20 || (unit === 'lb' && p >= 45) ? 'var(--accent)' : '#555',
                                        borderRadius: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '9px',
                                        color: p >= 20 || (unit === 'lb' && p >= 45) ? 'black' : 'white',
                                        fontWeight: 'bold',
                                        writingMode: 'vertical-rl',
                                        boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {p}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ marginTop: '3.5rem', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    {plates.length > 0 ? plates.map((p, i) => (
                        <span key={i} className="fade-in" style={{ background: '#222', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontWeight: 'bold', border: '1px solid #333' }}>
                            {p}{unit}
                        </span>
                    )) : (
                        <div style={{ color: 'var(--text-dim)' }}>Add weight to see plates</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlateCalculator;
