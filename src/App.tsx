import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, Settings2 } from 'lucide-react';
import './index.css';

const CURRENCIES = {
  NOK: { langCode: 'nb-NO', currencyCode: 'NOK' },
  GBP: { langCode: 'en-GB', currencyCode: 'GBP' },
  EUR: { langCode: 'de-DE', currencyCode: 'EUR' },
  USD: { langCode: 'en-US', currencyCode: 'USD' },
} as const;

type CurrencyKey = keyof typeof CURRENCIES;

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [total, setTotal] = useState(0);
  const [attendees, setAttendees] = useState(2);
  const [averageSalary, setAverageSalary] = useState(500000);
  const [currency, setCurrency] = useState<CurrencyKey>('NOK');
  const [showSettings, setShowSettings] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const incrementPerSecond = useMemo(() => {
    // 365 days - 104 weekends - 28 days holiday = 233 working days
    const workingDays = 233;
    const workingHours = workingDays * 7.5;
    const workingSeconds = workingHours * 60 * 60;
    const salaryPerSecond = averageSalary / workingSeconds;
    return salaryPerSecond * attendees;
  }, [attendees, averageSalary]);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTotal((prev) => prev + incrementPerSecond);
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, incrementPerSecond]);

  const activeCurrency = CURRENCIES[currency];

  const formattedTotal = new Intl.NumberFormat(activeCurrency.langCode, {
    style: 'currency',
    currency: activeCurrency.currencyCode,
  }).format(total);

  const formattedSalary = new Intl.NumberFormat(activeCurrency.langCode, {
    style: 'currency',
    currency: activeCurrency.currencyCode,
    maximumFractionDigits: 0,
  }).format(averageSalary);

  const formatElapsedTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  };

  // Update document title dynamically
  useEffect(() => {
    if (total > 0) {
      document.title = `${formattedTotal} - Meeting Cost`;
    } else {
      document.title = 'Meeting Cost Tracker';
    }
  }, [formattedTotal, total]);

  return (
    <div className={`app-container ${isRunning ? 'is-running' : ''}`}>
      <main className="glass-panel">
        <h2 className="title">Meeting Cost</h2>
        <div className="elapsed-time">{formatElapsedTime(elapsedSeconds)}</div>
        <div className="cost-display">{formattedTotal}</div>

        <button
          className={`action-button ${isRunning ? 'active' : ''}`}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <>
              <Pause size={20} /> Pause Meeting
            </>
          ) : (
            <>
              <Play size={20} /> Start Meeting
            </>
          )}
        </button>

        <button
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings2 size={16} /> {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>

        <div className={`settings-panel ${showSettings ? 'open' : 'closed'}`}>
          <div className="controls">
            <div className="control-group">
              <label htmlFor="attendees">
                <span>Number of Attendees</span>
              </label>
              <div className="attendee-stepper">
                <button 
                  className="stepper-btn" 
                  onClick={() => setAttendees(prev => Math.max(1, prev - 1))}
                  aria-label="Decrease attendees"
                >
                  -
                </button>
                <div className="stepper-value">{attendees}</div>
                <button 
                  className="stepper-btn" 
                  onClick={() => setAttendees(prev => prev + 1)}
                  aria-label="Increase attendees"
                >
                  +
                </button>
              </div>
            </div>

            <div className="control-group">
              <label htmlFor="salary">
                <span>Average Yearly Salary</span>
                <span style={{ color: '#f8fafc', fontWeight: 500 }}>{formattedSalary}</span>
              </label>
              <input
                id="salary"
                type="range"
                min="30000"
                max="2000000"
                step="10000"
                value={averageSalary}
                onChange={(e) => setAverageSalary(parseInt(e.target.value))}
              />
            </div>

            <div className="control-group">
              <label>Currency</label>
              <div className="currency-toggle">
                {(Object.keys(CURRENCIES) as CurrencyKey[]).map((curr) => (
                  <button
                    key={curr}
                    className={currency === curr ? 'active' : ''}
                    onClick={() => setCurrency(curr)}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        Originally made with ❤️ by <a href="https://twitter.com/simonleggsays" target="_blank" rel="noreferrer">Simon</a><br />
        Shamelessly forked and modernized
      </footer>
    </div>
  );
}

export default App;
