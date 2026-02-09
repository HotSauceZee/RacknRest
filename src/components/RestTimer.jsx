import { useState, useEffect, useRef, useCallback } from 'react';

const SOUND_KEY = 'timer-sound';
const RECENTS_KEY = 'timer-recents';
const SESSION_KEY = 'timer-session';
const LAST_DURATION_KEY = 'timer-last-duration';

const RestTimer = () => {
    const savedSound = localStorage.getItem(SOUND_KEY) !== 'false';

    const [time, setTime] = useState(0); // in seconds
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('stopwatch'); // 'stopwatch' or 'timer'
    const [soundEnabled, setSoundEnabled] = useState(savedSound);
    const [recentTimes, setRecentTimes] = useState(() => {
        try {
            const saved = localStorage.getItem(RECENTS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [lastTimerSeconds, setLastTimerSeconds] = useState(() => {
        const saved = Number(localStorage.getItem(LAST_DURATION_KEY));
        return Number.isFinite(saved) && saved > 0 ? saved : 0;
    });

    const intervalRef = useRef(null);
    const timerEndMsRef = useRef(null);
    const stopwatchStartMsRef = useRef(null);
    const stopwatchAccumulatedMsRef = useRef(0);

    const [customMins, setCustomMins] = useState('');
    const [customSecs, setCustomSecs] = useState('');

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleFinish = useCallback(() => {
        setIsActive(false);
        setTime(0);
        timerEndMsRef.current = null;

        if ('vibrate' in navigator) {
            navigator.vibrate([300, 150, 300]);
        }

        if (soundEnabled) {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.5);
            } catch (e) {
                console.log('Audio not supported', e);
            }
        }
    }, [soundEnabled]);

    const syncFromClock = useCallback(() => {
        if (!isActive) {
            return;
        }

        if (mode === 'timer') {
            if (!timerEndMsRef.current) {
                return;
            }

            const remainingMs = timerEndMsRef.current - Date.now();
            if (remainingMs <= 0) {
                handleFinish();
                return;
            }

            setTime(Math.ceil(remainingMs / 1000));
            return;
        }

        const startedAt = stopwatchStartMsRef.current ?? Date.now();
        const elapsedMs = stopwatchAccumulatedMsRef.current + (Date.now() - startedAt);
        setTime(Math.floor(elapsedMs / 1000));
    }, [isActive, mode, handleFinish]);

    const startTimer = useCallback((seconds) => {
        const safeSeconds = Math.max(1, Math.floor(seconds));
        const endMs = Date.now() + safeSeconds * 1000;

        setMode('timer');
        setTime(safeSeconds);
        setIsActive(true);
        timerEndMsRef.current = endMs;
        stopwatchStartMsRef.current = null;
        stopwatchAccumulatedMsRef.current = 0;
        setLastTimerSeconds(safeSeconds);
        localStorage.setItem(LAST_DURATION_KEY, String(safeSeconds));
    }, []);

    const startStopwatch = useCallback(() => {
        if (mode !== 'stopwatch') {
            stopwatchAccumulatedMsRef.current = 0;
            setTime(0);
        } else {
            stopwatchAccumulatedMsRef.current = Math.max(0, time) * 1000;
        }

        timerEndMsRef.current = null;
        stopwatchStartMsRef.current = Date.now();
        setMode('stopwatch');
        setIsActive(true);
    }, [mode, time]);

    const handleStart = useCallback(() => {
        if (isActive) {
            return;
        }

        if (mode === 'timer') {
            if (time > 0) {
                timerEndMsRef.current = Date.now() + time * 1000;
                setIsActive(true);
                return;
            }

            // If countdown reached zero, Start should begin stopwatch mode.
            startStopwatch();
            return;
        }

        startStopwatch();
    }, [isActive, mode, time, startStopwatch]);

    const pause = useCallback(() => {
        if (!isActive) {
            return;
        }

        if (mode === 'timer' && timerEndMsRef.current) {
            const remaining = Math.max(0, Math.ceil((timerEndMsRef.current - Date.now()) / 1000));
            timerEndMsRef.current = null;
            setTime(remaining);
        }

        if (mode === 'stopwatch' && stopwatchStartMsRef.current) {
            stopwatchAccumulatedMsRef.current += Date.now() - stopwatchStartMsRef.current;
            stopwatchStartMsRef.current = null;
            setTime(Math.floor(stopwatchAccumulatedMsRef.current / 1000));
        }

        setIsActive(false);
    }, [isActive, mode]);

    const reset = useCallback(() => {
        setIsActive(false);
        setTime(0);
        setMode('stopwatch');
        timerEndMsRef.current = null;
        stopwatchStartMsRef.current = null;
        stopwatchAccumulatedMsRef.current = 0;
    }, []);

    const handleCustomSet = () => {
        const mins = Math.max(0, Number(customMins) || 0);
        const secs = Math.max(0, Number(customSecs) || 0);
        const totalSeconds = Math.floor((mins * 60) + secs);

        if (totalSeconds > 0) {
            startTimer(totalSeconds);

            setRecentTimes(prev => {
                const newRecents = [totalSeconds, ...prev.filter(t => t !== totalSeconds)].slice(0, 3);
                localStorage.setItem(RECENTS_KEY, JSON.stringify(newRecents));
                return newRecents;
            });

            setCustomMins('');
            setCustomSecs('');
        }
    };

    useEffect(() => {
        localStorage.setItem(SOUND_KEY, soundEnabled);
    }, [soundEnabled]);

    useEffect(() => {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (!savedSession) {
            return;
        }

        try {
            const session = JSON.parse(savedSession);

            if (session.mode === 'timer') {
                setMode('timer');

                if (session.isActive && Number.isFinite(session.timerEndMs)) {
                    const remaining = Math.max(0, Math.ceil((session.timerEndMs - Date.now()) / 1000));
                    if (remaining > 0) {
                        timerEndMsRef.current = session.timerEndMs;
                        setTime(remaining);
                        setIsActive(true);
                    } else {
                        setTime(0);
                        setIsActive(false);
                    }
                } else {
                    const savedTime = Math.max(0, Number(session.time) || 0);
                    setTime(savedTime);
                    setIsActive(false);
                }
                return;
            }

            setMode('stopwatch');
            const savedTime = Math.max(0, Number(session.time) || 0);
            const savedAccumulatedMs = Number(session.stopwatchAccumulatedMs);
            stopwatchAccumulatedMsRef.current = Number.isFinite(savedAccumulatedMs)
                ? Math.max(0, savedAccumulatedMs)
                : savedTime * 1000;

            if (session.isActive && Number.isFinite(session.stopwatchStartMs)) {
                stopwatchStartMsRef.current = session.stopwatchStartMs;
                const elapsedMs = stopwatchAccumulatedMsRef.current + (Date.now() - session.stopwatchStartMs);
                setTime(Math.floor(elapsedMs / 1000));
                setIsActive(true);
            } else {
                setTime(savedTime);
                setIsActive(false);
                stopwatchStartMsRef.current = null;
            }
        } catch (error) {
            console.log('Failed to restore timer session', error);
        }
    }, []);

    useEffect(() => {
        if (isActive) {
            syncFromClock();
            intervalRef.current = setInterval(syncFromClock, 250);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, syncFromClock]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                syncFromClock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [syncFromClock]);

    useEffect(() => {
        const session = {
            mode,
            isActive,
            time,
            timerEndMs: timerEndMsRef.current,
            stopwatchStartMs: stopwatchStartMsRef.current,
            stopwatchAccumulatedMs: stopwatchAccumulatedMsRef.current,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }, [mode, isActive, time]);

    return (
        <div className="fade-in">
            <div className="card" style={{ textAlign: 'center', padding: '1.5rem', position: 'relative' }}>
                <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: soundEnabled ? 'var(--accent)' : 'var(--text-dim)',
                        transition: '0.2s',
                        zIndex: 10
                    }}
                    title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
                >
                    {soundEnabled ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                            <path d="M11 5L6 9H2V15H6L11 19V5Z"></path>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                    )}
                </button>

                <div style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {mode === 'stopwatch' ? 'Resting' : 'Countdown'}
                </div>
                <div style={{ fontSize: '4.5rem', fontWeight: '800', fontFamily: 'monospace', color: isActive && mode === 'timer' ? 'var(--accent)' : 'white', lineHeight: '1' }}>
                    {formatTime(time)}
                </div>

                <div className="flex-row" style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
                    {!isActive ? (
                        <button className="btn" style={{ padding: '0.6rem 2rem' }} onClick={handleStart}>Start</button>
                    ) : (
                        <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.6rem 2rem' }} onClick={pause}>Pause</button>
                    )}
                    <button className="btn btn-ghost" onClick={reset}>Reset</button>
                    {lastTimerSeconds > 0 && (
                        <button
                            className="btn btn-ghost"
                            style={{ background: '#111', border: '1px solid #222' }}
                            onClick={() => startTimer(lastTimerSeconds)}
                        >
                            Repeat {formatTime(lastTimerSeconds)}
                        </button>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="input-label">Custom Timer</div>
                <div className="grid-2" style={{ marginBottom: '1rem' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <input
                            type="number"
                            placeholder="Min"
                            value={customMins}
                            onChange={(e) => setCustomMins(e.target.value)}
                            style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <input
                            type="number"
                            placeholder="Sec"
                            value={customSecs}
                            onChange={(e) => setCustomSecs(e.target.value)}
                            style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                        />
                    </div>
                </div>
                <button
                    className={`btn ${customMins || customSecs ? '' : 'btn-outline'}`}
                    style={{
                        marginTop: '0.5rem',
                        width: '100%',
                        background: customMins || customSecs ? 'var(--accent)' : 'transparent',
                        color: customMins || customSecs ? 'black' : 'var(--text-dim)',
                        borderColor: customMins || customSecs ? 'var(--accent)' : '#333',
                        fontWeight: '800',
                        opacity: customMins || customSecs ? 1 : 0.5,
                        transition: '0.3s'
                    }}
                    onClick={handleCustomSet}
                >
                    {customMins || customSecs ? 'START TIMER' : 'Set Custom duration'}
                </button>

                {recentTimes.length > 0 && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.8rem', letterSpacing: '1px' }}>
                            Recent
                        </div>
                        <div className="flex-row" style={{ justifyContent: 'center', gap: '0.5rem' }}>
                            {recentTimes.map((t, i) => (
                                <button
                                    key={i}
                                    className="btn btn-ghost"
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.8rem', background: '#111', border: '1px solid #222' }}
                                    onClick={() => startTimer(t)}
                                >
                                    {formatTime(t)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="input-label" style={{ marginTop: '1rem' }}>Quick Presets</div>
            <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.6rem' }} onClick={() => startTimer(60)}>1:00</button>
                <button className="btn btn-outline" style={{ padding: '0.6rem' }} onClick={() => startTimer(90)}>1:30</button>
                <button className="btn btn-outline" style={{ padding: '0.6rem' }} onClick={() => startTimer(120)}>2:00</button>
                <button className="btn btn-outline" style={{ padding: '0.6rem' }} onClick={() => startTimer(180)}>3:00</button>
            </div>
        </div>
    );
};

export default RestTimer;
