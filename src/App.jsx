import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';


const TRACK_DEMO = {
  'MSC-4402-DE': {
    vessel: 'MV MSC Sovereign',
    origin: 'Durban, South Africa',
    dest: 'Rotterdam, Netherlands',
    loc: 'Mid-Atlantic — 1,820 nm from Rotterdam',
    eta: 'June 27, 2026',
    status: 'In Transit — Ocean Leg',
  },
  'MSC-1188-CN': {
    vessel: 'MV MSC Meridian',
    origin: 'Shanghai, China',
    dest: 'Long Beach, USA',
    loc: 'Pacific Ocean — approaching Hawaii',
    eta: 'July 2, 2026',
    status: 'In Transit — Ocean Leg',
  },
  'MSC-9022-AE': {
    vessel: 'MV MSC Horizon',
    origin: 'Jebel Ali, UAE',
    dest: 'Jeddah, Saudi Arabia',
    loc: 'Red Sea — approaching Jeddah port',
    eta: 'Arrived June 19, 2026',
    status: 'Customs Clearance',
  },
  'MSC-3304-DE': {
    vessel: 'MV MSC Pioneer',
    loc: 'Port Newark-Elizabeth Terminal',
    eta: 'Delivered June 14, 2026',
    status: 'Delivered ✓',
  },
};

const RATES = {
  GBP: { USD: 1.266, EUR: 1.165, CAD: 1.70, AED: 4.65, CNY: 9.19, GBP: 1 },
  CAD: { USD: 0.74, EUR: 0.69, GBP: 0.59, AED: 2.75, CNY: 5.40, CAD: 1 },
  AED: { USD: 0.272, EUR: 0.251, GBP: 0.215, CAD: 0.363, CNY: 1.978, AED: 1 },
  CNY: { USD: 0.1378, EUR: 0.1267, GBP: 0.1088, CAD: 0.185, AED: 0.506, CNY: 1 },
};

// Utility function to calculate next departure date based on day of week
const getNextDepartureDate = (dayOfWeek, frequency = 'Weekly') => {
  const today = new Date();
  const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const adjustedTarget = dayOfWeek === 0 ? 0 : dayOfWeek; // 0 = Monday in our system, but getDay has Sunday as 0
  const jsDay = adjustedTarget === 0 ? 1 : adjustedTarget + 1; // Convert to JS day of week
  
  let daysUntilNext = (jsDay - todayDay + 7) % 7;
  if (daysUntilNext === 0) daysUntilNext = 7; // If today is the departure day, next is 7 days later
  
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + daysUntilNext);
  
  const monthShort = nextDate.toLocaleString('en-US', { month: 'short' });
  const day = nextDate.getDate();
  return `${monthShort} ${day}`;
};

const VALID_IMAGE_1 = 'https://cdn.pixabay.com/photo/2014/12/08/12/19/container-ship-560789_1280.jpg';
const COMPANY_SHORT = 'MSC';
const COMPANY_NAME = 'MSC EUROPEAN & SHORT SEA NETWORK VIENNA';
const VALID_IMAGE_2 = 'https://cdn.pixabay.com/photo/2015/01/11/10/28/container-ship-596083_1280.jpg';

const iconMap = {
  ship: '🚢',
  container: '📦',
  crane: '🏗️',
  arrowRight: '➡️',
  check: '✔️',
  snowflake: '❄️',
  mapPin: '📍',
  truckDelivery: '🚚',
  fileCertificate: '📄',
  radioactive: '☢️',
  brandLinkedin: 'in',
  brandX: 'x',
  brandFacebook: 'f',
  brandInstagram: '📷',
  brandYoutube: '▶️',
  mapPinSmall: '📍',
  phone: '📞',
  mail: '✉️',
  clock: '⏰',
};

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Schedules', href: '#routes' },
  { label: 'Fleet', href: '#fleet' },
  { label: 'Offices', href: '#offices' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#footer' },
];

const services = [
  { icon: 'container', title: 'Full Container Load (FCL)', text: 'Dedicated 20ft and 40ft containers on weekly sailings from 50+ origin ports, door-to-port and port-to-port.' },
  { icon: 'package', title: 'Less Than Container (LCL)', text: 'Consolidated cargo for smaller shipments — share space with others, cut costs, keep the same tracking.' },
  { icon: 'snowflake', title: 'Reefer & Cold Chain', text: 'Temperature-controlled containers for perishables, pharma, and chemicals — monitored 24/7 by satellite.' },
  { icon: 'crane', title: 'Project & Heavy Cargo', text: 'Oversized and out-of-gauge cargo using flat-rack, open-top, and break-bulk solutions with custom rigging.' },
  { icon: 'fileCertificate', title: 'Customs & Documentation', text: 'Bills of lading, manifests, duties, and customs clearance handled by licensed agents at every MSC port.' },
  { icon: 'radioactive', title: 'Hazardous Goods (DG)', text: 'IMDG-certified dangerous goods handling with full compliance documentation and segregation protocols.' },
  { icon: 'mapPin', title: 'Port Agency', text: 'MSC agents represent your vessel at 200+ ports — husbandry, berthing, crew, and documentation.' },
  { icon: 'truckDelivery', title: 'Inland Haulage', text: 'Door-to-door freight connecting ports to inland depots, warehouses, and distribution hubs worldwide.' },
];

const routes = [
  {
    flags: ['🇪🇺', '🇨🇦'],
    title: 'Europe — Canada',
    desc: 'Rotterdam · Antwerp · Hamburg → Montreal · Toronto · Vancouver',
    transit: '12 days',
    freq: 'Weekly',
    nextDayOfWeek: 0,
  },
  {
    flags: ['🇨🇳', '🇺🇸'],
    title: 'Asia Pacific — USA',
    desc: 'Shanghai · Shenzhen · Busan → Long Beach · Seattle · New York',
    transit: '14 days',
    freq: '2× /wk',
    nextDayOfWeek: 1,
  },
  {
    flags: ['🇦🇪', '🇩🇪'],
    title: 'Middle East — Europe',
    desc: 'Jebel Ali · Port Said · Aqaba → Hamburg · Bremen · Rotterdam',
    transit: '22 days',
    freq: 'Weekly',
    nextDayOfWeek: 2,
  },
  {
    flags: ['🇸🇬', '🇬🇧'],
    title: 'Southeast Asia — UK',
    desc: 'Singapore · Colombo · Port Klang → Felixstowe · Southampton',
    transit: '25 days',
    freq: 'Weekly',
    nextDayOfWeek: 3,
  },
  {
    flags: ['🇿🇦', '🇧🇪'],
    title: 'Southern Africa — Europe',
    desc: 'Cape Town · Durban · Maputo → Antwerp · Hamburg · Marseille',
    transit: '21 days',
    freq: 'Weekly',
    nextDayOfWeek: 4,
  },
  {
    flags: ['🇧🇷', '🇮🇹'],
    title: 'South America — Mediterranean',
    desc: 'Santos · Buenos Aires · Montevideo → Genoa · Barcelona · Piraeus',
    transit: '19 days',
    freq: 'Weekly',
    nextDayOfWeek: 5,
  },
];

const offices = [
  {
    flag: '🇦🇹',
    city: 'Vienna, Austria',
    role: '⭐ Global Headquarters',
    address: 'Ringstraße 1, 1010 Vienna, Austria',
    phone: '',
    email: 'msccargovienna@gmail.com',
    hours: 'Mon–Fri 08:00–18:00 CET',
  },
  {
    flag: '🇳🇱',
    city: 'Rotterdam, Netherlands',
    role: 'European Hub',
    address: 'Wilhelminakade 92, Maasvlakte Terminal, 3072 AP Rotterdam, Netherlands',
    phone: '',
    email: 'msccargovienna@gmail.com',
    hours: 'Mon–Fri 08:00–17:30 CET',
  },
  {
    flag: '🇨🇳',
    city: 'Shanghai, China',
    role: 'Asia-Pacific Hub',
    address: '588 Yangshan Port Road, Pudong New Area, Shanghai 201306, China',
    phone: '',
    email: 'msccargovienna@gmail.com',
    hours: 'Mon–Fri 09:00–18:00 CST',
  },
  {
    flag: '🇦🇪',
    city: 'Dubai, UAE',
    role: 'Middle East Hub',
    address: 'Jebel Ali Free Zone, Gate 4, Office 212, Dubai, United Arab Emirates — 17888',
    phone: '',
    email: 'msccargovienna@gmail.com',
    hours: 'Sun–Thu 08:30–17:30 GST',
  },
  {
    flag: '🇺🇸',
    city: 'New York, USA',
    role: 'Americas Hub',
    address: '1 Port Authority Plaza, Port Newark–Elizabeth, Newark, New Jersey 07114, USA',
    phone: '',
    email: 'msccargovienna@gmail.com',
    hours: 'Mon–Fri 08:00–17:00 EST',
  },
  {
    flag: '🇩🇪',
    city: 'Hamburg, Germany',
    role: 'Northern Europe',
    address: 'Burchardkai 11, HHLA Container Terminal, 20457 Hamburg, Germany',
    phone: '',
    email: 'msccargovienna@gmail.com',
    hours: 'Mon–Fri 08:00–17:00 CET',
  },
];

const fleet = [
  {
    img: VALID_IMAGE_1,
    type: 'ULCS',
    name: 'MV MSC Sovereign',
    capacity: '20,000 TEU',
    length: '400 m',
  },
  {
    img: VALID_IMAGE_2,
    type: 'VLCS',
    name: 'MV MSC Meridian',
    capacity: '14,500 TEU',
    length: '366 m',
  },
  {
    img: VALID_IMAGE_1,
    type: 'Panamax',
    name: 'MV MSC Horizon',
    capacity: '5,000 TEU',
    length: '294 m',
  },
  {
    img: VALID_IMAGE_2,
    type: 'Feeder',
    name: 'MV MSC Pioneer',
    capacity: '2,800 TEU',
    length: '210 m',
  },
];

const galleryPhotos = [
  {
    img: VALID_IMAGE_1,
    label: 'Container ship at sea',
    big: true,
  },
  {
    img: VALID_IMAGE_2,
    label: 'Container yard',
  },
  {
    img: VALID_IMAGE_1,
    label: 'Port operations',
  },
  {
    img: VALID_IMAGE_2,
    label: 'Container storage',
  },
  {
    img: VALID_IMAGE_1,
    label: 'Ocean voyage',
  },
];

const partners = ['HAPAG-LLOYD', 'MAERSK', 'CMA CGM', 'COSCO', 'ONE OCEAN', 'ZIM LINE'];

function Icon({ name, label }) {
  return (
    <span className="icon" aria-label={label ?? name}>
      {iconMap[name] || '•'}
    </span>
  );
}

function App() {
  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState(10000);
  const [fetchedRate, setFetchedRate] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');

  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (location.state?.customerWelcome) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // load current user from localStorage
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (u) setCurrentUser(u);
    } catch (e) {
      // ignore
    }
  }, [location, navigate]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const rate = useMemo(() => {
    return fetchedRate ?? (RATES[fromCurrency]?.[toCurrency] ?? 1);
  }, [fromCurrency, toCurrency, fetchedRate]);

  const converted = useMemo(() => {
    const value = Number(amount) || 0;
    const result = value * rate;
    return result >= 1000 ? result.toLocaleString('en-US', { maximumFractionDigits: 2 }) : result.toFixed(4);
  }, [amount, rate]);

  // Fetch live FX rate (exchangerate.host) when currencies change
  useEffect(() => {
    let cancelled = false;
    async function fetchRate() {
      try {
        const res = await fetch(`https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}`);
        const json = await res.json();
        if (!cancelled && json && json.rates && json.rates[toCurrency]) {
          setFetchedRate(json.rates[toCurrency]);
        }
      } catch (e) {
        setFetchedRate(null);
      }
    }
    fetchRate();
    const id = setInterval(fetchRate, 60000); // refresh every 60s
    return () => { cancelled = true; clearInterval(id); };
  }, [fromCurrency, toCurrency]);

  const handleTrack = () => {
    (async () => {
      const id = trackInput.trim().toUpperCase();
      if (!id) return;

      // try local storage / server-synced tracks first
      try {
        const res = await fetch('/api/track');
        if (res.ok) {
          const list = await res.json();
          const found = (list || []).find((s) => (s.id || '').toUpperCase() === id);
          if (found) {
            setTrackResult({ id, ...found });
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      const stored = JSON.parse(localStorage.getItem('tracks') || '[]');
      const foundLocal = (stored || []).find((s) => (s.id || '').toUpperCase() === id);
      if (foundLocal) {
        setTrackResult({ id, ...foundLocal });
        return;
      }

      const result = TRACK_DEMO[id] ?? {
        vessel: '—',
        origin: '—',
        dest: '—',
        loc: 'No scan events found for this ID',
        eta: '—',
        status: 'Awaiting first port scan',
      };
      setTrackResult({ id: id || '—', ...result });
    })();
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleQuote = () => {
    window.location.href = 'mailto:info@mscshortsea.com?subject=Request%20a%20Quote';
  };

  const handleViewSchedules = () => {
    document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewFleet = () => {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactDesk = () => {
    window.location.href = 'mailto:info@mscshortsea.com?subject=Freight%20Desk%20Inquiry';
  };

  const handleNavigate = (href) => {
    setIsMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewAction = () => {
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
  };

  const trackItems = trackResult
    ? [
        { label: 'Container ID', value: trackResult.id },
        { label: 'Vessel', value: trackResult.vessel },
        { label: 'Origin', value: trackResult.origin },
        { label: 'Destination', value: trackResult.dest },
        { label: 'Current location', value: trackResult.loc },
        { label: 'ETA', value: trackResult.eta },
      ]
    : [];

  return (
    <div id="home">
      <div className="ticker">
        <div className="ticker-label">LIVE</div>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {['Vienna → Canada', 'Shanghai → Long Beach', 'Dubai → Hamburg', 'Singapore → New York', 'Cape Town → Antwerp', 'Mumbai → Rotterdam', 'Tokyo → Los Angeles', 'Busan → Seattle'].map((item, idx) => (
              <span key={idx}>
                {item}
                {idx < 7 ? <span className="sep">▸</span> : null}
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className={isMenuOpen ? 'open' : ''}>
        <div className="hdr">
          <div className="logo">
            <div className="logo-badge">
              <b>{COMPANY_SHORT}</b>
              <small>NETWORK</small>
            </div>
            <div style={{ marginLeft: 8 }}>
              <div className="logo-text">
                <strong>{COMPANY_NAME}</strong>
                <em>Global Shipping Solutions</em>
              </div>
            </div>
          </div>

          <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigate(link.href);
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            type="button"
            aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="hdr-btns" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              <span>🌐</span>
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 4, padding: '4px 8px' }}
              >
                <option value="EN">EN</option>
                <option value="VI">VI</option>
                <option value="FR">FR</option>
                <option value="ES">ES</option>
              </select>
            </div>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: '#fff', color: '#0f1724', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                </div>
                <button className="btn-login" type="button" onClick={() => { localStorage.removeItem('currentUser'); setCurrentUser(null); navigate('/login'); }}>Logout</button>
              </div>
            ) : null}
            <button className="btn-track" type="button" onClick={() => document.getElementById('track-input')?.focus()}>
              <Icon name="mapSearch" label="Track icon" /> Track Cargo
            </button>
          </div>
        </div>
        <div className="subnav">
          <div className="subnav-inner">
            {['Container Shipping', 'Bulk Cargo', 'Reefer & Cold Chain', 'Hazardous Goods', 'Project Cargo', 'Customs Clearance', 'Port Agency'].map((item) => (
              <a key={item} href="#services">
                {item}
              </a>
            ))}
          </div>
        </div>
      </header>

      <Link to="/login" state={{ admin: true }} className="admin-shortcut" style={{ display: 'inline-block', margin: '12px 18px', padding: '6px 10px', fontSize: 12, borderRadius: 8, textDecoration: 'none' }}>Admin</Link>

      <section className="hero">
            <img className="hero-img" src={VALID_IMAGE_1} alt={`${COMPANY_SHORT} container ship at sea`} loading="eager" />
        <div className="hero-overlay" />
        <div className="hero-content">
          {location.state?.customerWelcome ? (
            <div style={{ marginBottom: 18, padding: '14px 18px', borderRadius: 18, background: 'rgba(255, 255, 255, 0.95)', color: '#0f1724', border: '1px solid rgba(15, 23, 42, 0.1)', boxShadow: '0 18px 35px rgba(15, 23, 42, 0.08)' }}>
              <strong>
                Welcome back{location.state.customerName ? `, ${location.state.customerName.charAt(0).toUpperCase() + location.state.customerName.slice(1)}` : ''}!
              </strong>
              <div style={{ marginTop: 6 }}>Your customer dashboard is ready — start tracking shipments or request a quote.</div>
            </div>
          ) : null}
          <div className="hero-badge">
            <Icon name="ship" label="Ship icon" /> Trusted by 12,000+ Shippers Worldwide
          </div>
          <h1>
            Move Your <span>Cargo</span>
            <br />Across Every Ocean
          </h1>
          <p>
            {COMPANY_NAME} operates a reliable container shipping network — 200+ ports, 6 continents, weekly sailings, and real-time tracking on every container from door to door.
          </p>
          <div className="hero-btns">
            <button className="btn-ghost" onClick={handleViewSchedules}>View Schedules</button>
          </div>
          <div className="hero-stats">
            {[
              { value: '200+', label: 'Ports served' },
              { value: '520k', label: 'TEU capacity' },
              { value: '98', label: 'Active vessels' },
              { value: '32yr', label: 'Experience' },
            ].map((stat) => (
              <div key={stat.label} className="hstat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="track-widget">
            <h3>
              <Icon name="mapSearch" label="Track icon" /> Track Your Container
            </h3>
            <div className="track-row">
              <input
                id="track-input"
                value={trackInput}
                onChange={(event) => setTrackInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleTrack()}
                placeholder="Container or B/L number"
              />
              <button id="track-btn" onClick={handleTrack} type="button">
                Track
              </button>
            </div>
            {trackResult ? (
              <div className="track-result show" id="track-result">
                <div className="tr-grid">
                  {trackItems.map((item) => (
                    <div className="tr-item" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="tr-status">{trackResult.status}</div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="photo-strip">
        <div className="main-photo">
          <img src={VALID_IMAGE_2} alt="Large cargo container ship fully loaded with colourful containers" />
          <div className="photo-label">
            <Icon name="ship" label="Ship icon" /> MV MSC Sovereign — 20,000 TEU
          </div>
        </div>
        <div className="side-photos">
          <div className="side-photo">
            <img src={VALID_IMAGE_1} alt="Stacked shipping containers at port terminal" />
            <div className="photo-label" style={{ fontSize: 10 }}>
              <Icon name="container" label="Container icon" /> Port Terminal
            </div>
          </div>
          <div className="side-photo">
            <img src={VALID_IMAGE_2} alt="Container ship with cranes at port" />
            <div className="photo-label" style={{ fontSize: 10 }}>
              <Icon name="crane" label="Crane icon" /> Port Operations
            </div>
          </div>
        </div>
        <div className="side-photo3">
          <div className="side-photo">
            <img src={VALID_IMAGE_1} alt="Cargo containers stacked high at shipping yard" />
            <div className="photo-label" style={{ fontSize: 10 }}>
              <Icon name="package" label="Package icon" /> Container Yard
            </div>
          </div>
          <div className="side-photo">
            <img src={VALID_IMAGE_2} alt="Cargo ship sailing at sunset" />
            <div className="photo-label" style={{ fontSize: 10 }}>
              <Icon name="anchor" label="Anchor icon" /> At Sea
            </div>
          </div>
        </div>
      </div>

      <div className="stats-bar">
        {[
          { value: '200+', label: 'Ports worldwide' },
          { value: '520k TEU', label: 'Fleet capacity' },
          { value: '98', label: 'Active vessels' },
          { value: '12,000+', label: 'Clients served' },
          { value: '6', label: 'Continents' },
        ].map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <section id="services" className="services">
          <div className="sec-head">
            <div className="ey">What We Move</div>
            <h2>Comprehensive Cargo Shipping Services</h2>
            <p>
              From a single pallet to a full vessel charter — {COMPANY_SHORT} handles every cargo type with speed, transparency, and full tracking.
            </p>
        </div>
        <div className="svc-grid">
          {services.map((service) => (
            <div key={service.title} className="svc-card">
              <div className="svc-icon">
                <Icon name={service.icon} label={service.title} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <div className="svc-arrow">
                Learn more <Icon name="arrowRight" label="Arrow right" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="showcase">
        <div className="showcase-inner">
          <div className="showcase-text">
            <div className="ey" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ display: 'inline-block', width: 18, height: 2, background: 'var(--orange)' }} /> Our Container Fleet
            </div>
            <h2>180,000+ Containers in Active Global Circulation</h2>
            <p>
              {COMPANY_NAME} operates one of the largest proprietary container fleets in the world — GPS-tracked, ISO-certified, and available in standard, high-cube, reefer, flat-rack, and open-top configurations on every trade lane we serve.
            </p>
            <div className="feat-list">
              {[
                '20ft & 40ft standard containers available on all major trade lanes with weekly sailings.',
                'High-cube and reefer containers for volume cargo and temperature-sensitive goods, 24/7 monitored.',
                'GPS tracking on every box — real-time location from departure port to final delivery point.',
                'ISO 9001 certified maintenance with pre-voyage inspection at every loading port globally.',
              ].map((text, idx) => (
                <div key={idx} className="feat-item">
                  <div className="feat-check">
                    <Icon name="check" label="Check icon" />
                  </div>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="showcase-photo">
            <img src={VALID_IMAGE_2} alt={`${COMPANY_SHORT} container ship fully loaded`} />
            <div className="showcase-photo-overlay" />
            <div className="showcase-badge">
              {[
                { title: '20ft', label: 'Standard GP' },
                { title: '40ft HC', label: 'High-Cube' },
                { title: 'RF-20', label: 'Reefer' },
                { title: 'OT-40', label: 'Open Top' },
              ].map((item) => (
                <div className="sbadge" key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="gallery">
        <div className="gallery-inner">
          <div className="sec-head">
            <div className="ey" style={{ color: '#ffa552' }}>{COMPANY_SHORT} in Action</div>
            <h2 style={{ color: '#fff' }}>Our Fleet & Port Operations</h2>
            <p style={{ color: '#7ba7d8' }}>
              Real cargo. Real ships. Real reliability — across every ocean, every week.
            </p>
          </div>
          <div className="gallery-grid">
            {galleryPhotos.map((item, idx) => (
              <div key={idx} className={item.big ? 'gal-item big' : 'gal-item'}>
                <img src={item.img} alt={item.label} />
                <div className="gal-overlay">
                  <div className="gal-label">
                    <Icon name={item.big ? 'ship' : 'container'} label={item.label} /> {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-inner">
          <div className="sec-head">
            <div className="ey" style={{ color: '#ffa552' }}>About Us</div>
            <h2 style={{ color: '#fff' }}>{COMPANY_NAME}</h2>
            <p style={{ color: '#7ba7d8' }}>
              Headquartered in Vienna, Austria, we combine European short-sea expertise with intelligent logistics operations. {COMPANY_NAME} delivers dependable container services with smarter routing, customs support, and full cargo visibility.
            </p>
          </div>
          <div className="about-grid about-expanded">
            <div className="about-card about-highlight">
              <h3>Vienna Leadership, Global Reach</h3>
              <p>Our Vienna-based command center manages route planning, port agency coordination and customer service across key European, Mediterranean and transatlantic corridors.</p>
              <p>We focus on seamless short-sea container movements, flexible feeder connections, and reliable inland support to keep cargo moving from first mile to last mile.</p>
            </div>
            <div className="about-card">
              <h3>Fast, Transparent Operations</h3>
              <p>Weekly schedules, digital status updates, and proactive customs clearance mean fewer surprises and better delivery confidence for every shipment.</p>
            </div>
            <div className="about-card">
              <h3>Sustainable Short-Sea Service</h3>
              <p>We optimize sailings on regional European routes, reduce road miles, and support greener supply chains with efficient port rotations and modern fleet technology.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="routes" className="routes">
        <div className="routes-inner">
          <div className="sec-head">
            <div className="ey" style={{ color: '#ffa552' }}>Trade Lanes</div>
            <h2 style={{ color: '#fff' }}>Global Shipping Routes</h2>
            <p style={{ color: '#7ba7d8' }}>
              Weekly and bi-weekly fixed sailings on 30+ trade lanes connecting all major economies.
            </p>
          </div>
          <div className="routes-grid">
            {routes.map((route) => (
              <div key={route.title} className="route-card">
                <div className="route-flags">
                  <span>{route.flags[0]}</span>
                  <Icon name="arrowsRightLeft" label="Route arrow" />
                  <span>{route.flags[1]}</span>
                </div>
                <h4>{route.title}</h4>
                <div className="route-sub">{route.desc}</div>
                <div className="route-meta">
                  <div className="rm">
                    <span>Transit</span>
                    <strong>{route.transit}</strong>
                  </div>
                  <div className="rm">
                    <span>Freq</span>
                    <strong>{route.freq}</strong>
                  </div>
                  <div className="rm">
                    <span>Next</span>
                    <strong>{getNextDepartureDate(route.nextDayOfWeek, route.freq)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="offices" className="offices">
        <div className="offices-inner">
          <div style={{ marginBottom: 28 }}>
            <div className="ey" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ display: 'inline-block', width: 18, height: 2, background: 'var(--orange)' }} /> Global Offices
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)' }}>Our Worldwide Port Offices</h2>
            <p style={{ fontSize: 14.5, color: 'var(--mid)', marginTop: 8, maxWidth: 520 }}>
              Local {COMPANY_SHORT} agents who know the port, the paperwork, and your cargo by name. Reach us 24/7.
            </p>
          </div>
          <div className="offices-grid">
            {offices.map((office) => (
              <div key={office.city} className={office.role.includes('Headquarters') ? 'office-card hq' : 'office-card'}>
                <div className="office-top">
                  <div className="office-flag">{office.flag}</div>
                  <div>
                    <div className="office-info">
                      <h4>{office.city}</h4>
                    </div>
                    <div className="office-role">{office.role}</div>
                  </div>
                </div>
                <address>{office.address}</address>
                <div className="office-contact">
                  <span>✉️ <a href="#">{office.email}</a></span>
                  <span style={{ fontSize: 11, color: 'var(--mid)' }}>{office.hours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fleet" className="fleet">
        <div className="fleet-inner">
          <div className="sec-head">
            <div className="ey">Our Fleet</div>
            <h2>98 Vessels, Every Ocean</h2>
            <p>{COMPANY_NAME} maintains a modern fleet of container ships from feeder vessels to ultra-large container ships (ULCS).</p>
            <button className="btn-ghost fleet-action" type="button" onClick={handleViewAction}>Explore MSC in Action</button>
          </div>
          <div className="fleet-grid">
            {fleet.map((item) => (
              <div key={item.name} className="fleet-card">
                <div className="fleet-img">
                  <img src={item.img} alt={item.name} />
                  <div className="fleet-type">{item.type}</div>
                </div>
                <div className="fleet-body">
                  <h4>{item.name}</h4>
                  <div className="fleet-stats">
                    <div className="fstat">
                      <span>Capacity</span>
                      <strong>{item.capacity}</strong>
                    </div>
                    <div className="fstat">
                      <span>Length</span>
                      <strong>{item.length}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="currency">
        <div className="currency-inner">
          <div style={{ fontSize: 11, color: '#ffa552', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Freight Payments</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Currency Exchange Estimate</h2>
          <p style={{ color: '#a8c4f0', fontSize: 14.5, maxWidth: 480, margin: '0 auto' }}>
            Estimate freight invoice values in USD, EUR, GBP, CAD, AED or CNY before wiring payment.
          </p>
          <div className="fx-card">
            <div className="fx-row">
              <div>
                <label className="fx-label" htmlFor="fx-from-a">From</label>
                <div className="fx-wrap">
                  <select id="fx-from-c" value={fromCurrency} onChange={(event) => setFromCurrency(event.target.value)}>
                    {['USD', 'EUR', 'GBP', 'CAD', 'AED', 'CNY'].map((code) => (
                      <option key={code} value={code}>{code === 'USD' ? '🇺🇸 USD' : code === 'EUR' ? '🇪🇺 EUR' : code === 'GBP' ? '🇬🇧 GBP' : code === 'CAD' ? '🇨🇦 CAD' : code === 'AED' ? '🇦🇪 AED' : '🇨🇳 CNY'}</option>
                    ))}
                  </select>
                  <input
                    id="fx-from-a"
                    type="number"
                    min="0"
                    step="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </div>
              </div>

              <button className="fx-swap-btn" id="fx-swap" type="button" aria-label="Swap currencies" onClick={handleSwap}>
                <Icon name="arrowsRightLeft" label="Swap currencies" />
              </button>

              <div>
                <label className="fx-label" htmlFor="fx-to-a">To</label>
                <div className="fx-wrap">
                  <select id="fx-to-c" value={toCurrency} onChange={(event) => setToCurrency(event.target.value)}>
                    {['EUR', 'USD', 'GBP', 'CAD', 'AED', 'CNY'].map((code) => (
                      <option key={code} value={code}>{code === 'USD' ? '🇺🇸 USD' : code === 'EUR' ? '🇪🇺 EUR' : code === 'GBP' ? '🇬🇧 GBP' : code === 'CAD' ? '🇨🇦 CAD' : code === 'AED' ? '🇦🇪 AED' : '🇨🇳 CNY'}</option>
                    ))}
                  </select>
                  <input id="fx-to-a" type="text" value={converted} readOnly />
                </div>
              </div>
            </div>
            <div className="fx-rate">Indicative rate: <b>1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</b></div>
            <div className="fx-note">For freight invoice estimation only. Final rate set by your financial institution at settlement. {COMPANY_SHORT} accepts USD, EUR, GBP, CAD, AED and CNY.</div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <img className="cta-img" src={VALID_IMAGE_1} alt={`${COMPANY_SHORT} cargo ship at sea`} />
        <div className="cta-overlay" />
        <div className="cta-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(245,130,30,0.25)', border: '1px solid rgba(245,130,30,0.5)', borderRadius: 20, padding: '5px 14px', fontSize: 11.5, color: '#ffa552', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 18 }}>
            <Icon name="ship" label="Ship icon" /> Ready to Ship with {COMPANY_SHORT}?
          </div>
          <h2>Book Cargo Space on the Next Sailing</h2>
          <p>Tell us your cargo size, origin, and destination — our freight desk replies with container options within one business day.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-ghost" onClick={handleViewSchedules}>View Schedules</button>
          </div>
        </div>
      </section>

      <div className="partners">
        <h3>Trusted by global industry leaders</h3>
        <div className="partners-row">
          {partners.map((partner) => (
            <div key={partner} className="partner">{partner}</div>
          ))}
        </div>
      </div>

      <footer id="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo-badge"><b>{COMPANY_SHORT}</b></div>
            <strong>{COMPANY_NAME}</strong>
            <em>Global Shipping Solutions</em>
            <p>
              {COMPANY_NAME} is an international cargo shipping company operating container vessels, port offices and freight agents across 6 continents and 200+ ports since 1994. Your cargo, our commitment.
            </p>
            <div className="footer-socials">
              <div className="soc-icon"><Icon name="brandLinkedin" label="LinkedIn" /></div>
              <div className="soc-icon"><Icon name="brandX" label="X" /></div>
              <div className="soc-icon"><Icon name="brandFacebook" label="Facebook" /></div>
              <div className="soc-icon"><Icon name="brandInstagram" label="Instagram" /></div>
              <div className="soc-icon"><Icon name="brandYoutube" label="YouTube" /></div>
            </div>
          </div>
          <div className="footer-col">
            <h5>Services</h5>
            <ul>
              {['Full Container Load (FCL)', 'Less Than Container (LCL)', 'Reefer & Cold Chain', 'Project Cargo', 'Hazardous Goods DG', 'Customs Clearance', 'Inland Haulage', 'Port Agency'].map((item) => (
                <li key={item}><a href="#services">{item}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              {['About MSC European & Short Sea Network Vienna', 'Our Fleet', 'Sustainability', 'Careers', 'Press Room', 'Investor Relations', 'Schedules & Tariffs', 'Terms & Conditions'].map((item) => (
                <li key={item}><a href="#about">{item}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h5>Headquarters</h5>
            <div className="fcont"><Icon name="mapPinSmall" label="Map pin" /><span>Ringstraße 1, 1010 Vienna, Austria</span></div>
            <div className="fcont"><Icon name="phone" label="Phone" /><span>+1 436 65 2336447</span></div>
            <div className="fcont"><Icon name="mail" label="Mail" /><span>msccargovienna@gmail.com</span></div>
            <div className="fcont"><Icon name="clock" label="Clock" /><span>Mon–Fri 08:00–18:00 ICT<br />24/7 Operations Hotline</span></div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 12, fontSize: 13 }}>Contact Freight Desk</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 {COMPANY_NAME}. All rights reserved. IMO No. 1234567. Images: Pixabay (free licence).</p>
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/cookie-policy">Cookie Policy</Link>
            <Link to="/carrier-liability">Carrier Liability</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
