import React, { useState, useEffect } from 'react';
import './index.css';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';

// Hook personalizado para persistencia de datos (Local Storage)
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Icons (Lucide-like SVG set) - Unified 24x24
const IconShield = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>;
const IconDash = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>;
const IconMap = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconPhone = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
const IconGlobe = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const IconSet = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconBell = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconLock = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconUnlock = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>;
const IconTrash = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconPlay = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IconGame = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>;
const IconPlus = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconUser = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

function App() {
  const [currentRoute, setCurrentRoute] = useLocalStorage('appRoute', 'onboard');
  const [deviceLocked, setDeviceLocked] = useLocalStorage('deviceLocked', false);
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'dashboard');
  const [parentPin, setParentPin] = useLocalStorage('parentPin', null);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [appsData, setAppsData] = useLocalStorage('appsData', [
    {id: 1, name: 'YouTube', type: 'Entretenimiento', bg: '#FF0000', time: 'Acceso Total', active: true, iconName: 'play'},
    {id: 2, name: 'Roblox', type: 'Juegos', bg: '#00FF9D', time: '1h diaria', active: true, iconName: 'game'},
    {id: 3, name: 'Google Chrome', type: 'Seguro', bg: '#00F0FF', time: 'Filtrado', active: true, iconName: 'globe'}
  ]);

  const [geofences, setGeofences] = useLocalStorage('geofences', [
    { id: 1, name: 'Escuela Primaria', radius: '500m', active: true },
    { id: 2, name: 'Casa', radius: '200m', active: false }
  ]);

  const [blockedUrls, setBlockedUrls] = useLocalStorage('blockedUrls', ['pornhub.com', 'casino.com', 'bet365.com']);
  const [newUrl, setNewUrl] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [passValue, setPassValue] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    getRedirectResult(auth).then((result) => {
      if (result && result.user) {
        setCurrentUser(result.user);
        setCurrentRoute('dashboard');
        setActiveTab('dashboard');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if ((currentRoute === 'dashboard' || activeTab) && parentPin) {
      setIsSessionLocked(true);
    }
  }, []);

  const handleToggleDeviceLock = () => setDeviceLocked(!deviceLocked);

  const handleToggleApp = (id) => {
    setAppsData(appsData.map(app => 
      app.id === id ? { ...app, active: !app.active, time: !app.active ? 'Restaurado' : 'Bloqueado por Padre' } : app
    ));
  };

  const handleLimitApp = (appName) => {
    const limit = window.prompt(`Límite diario para ${appName} (minutos):`, "60");
    if (limit) alert(`Límite de ${limit} min establecido para ${appName}.`);
  };

  const addGeofence = () => {
    const name = window.prompt("Nombre de la zona segura:");
    if (name) setGeofences([...geofences, { id: Date.now(), name, radius: "300m", active: true }]);
  };

  const removeGeofence = (id) => setGeofences(geofences.filter(f => f.id !== id));

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (newUrl && !blockedUrls.includes(newUrl)) {
      setBlockedUrls([...blockedUrls, newUrl]);
      setNewUrl('');
    }
  };

  const removeUrl = (url) => setBlockedUrls(blockedUrls.filter(u => u !== url));

  const renderIcon = (name) => {
    switch(name) {
      case 'play': return <IconPlay />;
      case 'game': return <IconGame />;
      case 'globe': return <IconGlobe />;
      default: return <IconPhone />;
    }
  };

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    try {
      if (authMode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, emailValue, passValue);
        await sendEmailVerification(cred.user);
        alert('Verifica tu correo.');
        await signOut(auth);
        setAuthMode('login');
      } else {
        const cred = await signInWithEmailAndPassword(auth, emailValue, passValue);
        if (!cred.user.emailVerified) {
          await signOut(auth);
          setAuthError('Correo no verificado.');
        } else {
          setCurrentRoute('dashboard');
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      setAuthError(err.message);
    }
    setIsAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (err) {
      setAuthError(err.message);
      setIsAuthLoading(false);
    }
  };

  // --- RENDERS ---

  if (isSessionLocked) {
    return (
      <div className="auth-wrapper">
        <div className="glass-card auth-card" style={{textAlign: 'center'}}>
          <IconLock size={60} color="var(--danger)" style={{marginBottom: '20px'}} />
          <h2>Bloqueo Parental</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '30px'}}>Ingresa tu PIN de 4 dígitos</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const pin = Array.from(e.target.elements).filter(el => el.tagName === 'INPUT').map(el => el.value).join('');
            if (pin === parentPin) setIsSessionLocked(false);
            else alert('PIN Incorrecto');
          }} style={{display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap'}}>
            {[1,2,3,4].map(i => <input key={i} type="password" maxLength="1" className="input-field" style={{width: '60px', textAlign: 'center', fontSize: '24px'}} required autofocus={i===1} />)}
            <div style={{width: '100%', marginTop: '20px'}}><button className="btn-primary">Acceder</button></div>
          </form>
        </div>
      </div>
    );
  }

  if (currentRoute === 'onboard') {
    return (
      <div className="auth-wrapper" style={{flexDirection: 'column'}}>
        <IconShield size={100} color="var(--primary)" style={{marginBottom: '20px'}} />
        <h1 style={{fontSize: '48px', fontWeight: '800', marginBottom: '8px'}}>NiñoSafe</h1>
        <p style={{color: 'var(--text-secondary)', marginBottom: '48px', textAlign: 'center'}}>Ecosistema de Seguridad Familiar</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', width: '100%', maxWidth: '800px'}}>
          <div className="glass-card" style={{cursor: 'pointer', textAlign: 'center'}} onClick={() => setCurrentRoute('parent_login')}>
            <IconUser size={56} color="var(--primary)" style={{margin: '0 auto 16px'}} />
            <h2>Modo Padre</h2>
            <p style={{fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px'}}>Control remoto y monitoreo total</p>
          </div>
          <div className="glass-card" style={{cursor: 'pointer', textAlign: 'center', borderTop: '4px solid var(--accent)'}} onClick={() => setCurrentRoute('child_pair')}>
            <IconPhone size={56} color="var(--accent)" style={{margin: '0 auto 16px'}} />
            <h2>Modo Niño</h2>
            <p style={{fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px'}}>Protección activa en tiempo real</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentRoute === 'parent_login') {
    return (
      <div className="auth-wrapper">
        <div className="glass-card auth-card">
          <div style={{textAlign: 'center', marginBottom: '32px'}}><IconShield size={48} color="var(--primary)" /><h2>{authMode === 'login' ? 'Bienvenido' : 'Nueva Cuenta'}</h2></div>
          {authError && <div style={{color: 'var(--danger)', marginBottom: '16px', background: 'rgba(255,51,102,0.1)', padding: '10px', borderRadius: '8px', fontSize: '13px'}}>{authError}</div>}
          <form onSubmit={handleFirebaseLogin}>
            <div className="input-group"><span className="input-label">Email Corporativo / Personal</span><input className="input-field" type="email" value={emailValue} onChange={e => setEmailValue(e.target.value)} required /></div>
            <div className="input-group"><span className="input-label">Contraseña de Seguridad</span><input className="input-field" type="password" value={passValue} onChange={e => setPassValue(e.target.value)} required /></div>
            <button className="btn-primary" type="submit">{isAuthLoading ? 'Procesando...' : (authMode === 'login' ? 'Entrar al Panel' : 'Crear Cuenta')}</button>
            <button className="btn-google" type="button" onClick={handleGoogleLogin}>Utilizar cuenta Google</button>
            <p onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{textAlign: 'center', marginTop: '24px', cursor: 'pointer', color: 'var(--primary)', fontWeight: '600'}}>
              {authMode === 'login' ? '¿Eres nuevo aquí? Regístrate gratis' : 'Ya tengo cuenta, ir a Login'}
            </p>
            <div style={{textAlign: 'center', marginTop: '24px'}}><span onClick={() => setCurrentRoute('onboard')} style={{cursor: 'pointer', color: 'var(--text-secondary)'}}>← Volver al Inicio</span></div>
          </form>
        </div>
      </div>
    );
  }

  if (currentRoute === 'child_pair') {
    return (
      <div className="auth-wrapper">
        <div className="glass-card auth-card" style={{textAlign: 'center'}}>
          <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(var(--primary-rgb),0.2)', display: 'grid', placeItems: 'center', margin: '0 auto 24px'}}><IconShield size={48} color="var(--primary)" /></div>
          <h2 style={{fontSize: '28px'}}>Modo Niño Protegido</h2>
          <p style={{color: 'var(--text-secondary)', margin: '16px 0 32px'}}>Este dispositivo está bajo la supervisión de NiñoSafe. Todas las actividades sospechosas serán reportadas al padre.</p>
          <div className="glass-card" style={{background: 'rgba(255,255,255,0.03)', padding: '24px', marginBottom: '32px'}}>
             <p style={{fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px'}}>Estado del Vínculo</p>
             <p style={{fontSize: '24px', fontWeight: '700', marginTop: '8px', color: 'var(--success)'}}>● VINCULADO</p>
             <p style={{fontSize: '11px', marginTop: '8px'}}>ID: SAF-ANDROID-772X</p>
          </div>
          <button className="btn-primary" style={{background: 'transparent', border: '1px solid var(--border)', color: 'white'}} onClick={() => setCurrentRoute('onboard')}>Cerrar Modo Niño</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand"><IconShield className="brand-icon" size={36} /><span className="brand-text">NiñoSafe</span></div>
        <nav className="nav-links">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><IconDash /> <span>Inicio</span></div>
          <div className={`nav-item ${activeTab === 'location' ? 'active' : ''}`} onClick={() => setActiveTab('location')}><IconMap /> <span>Ubicación</span></div>
          <div className={`nav-item ${activeTab === 'apps' ? 'active' : ''}`} onClick={() => setActiveTab('apps')}><IconGlobe /> <span>Web</span></div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><IconSet /> <span>Configurar</span></div>
        </nav>
        <div className="lock-sidebar-container">
          <button className={`btn-lock ${deviceLocked ? 'unlocked' : ''}`} onClick={handleToggleDeviceLock}>
            {deviceLocked ? <IconUnlock /> : <IconLock />} <span>{deviceLocked ? 'Desbloquear' : 'Corte Total'}</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>{activeTab === 'dashboard' ? 'Resumen de Hoy' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p>Estado del dispositivo: <b style={{color: 'var(--success)'}}>Conectado</b></p>
          </div>
          <div className="header-actions">
            <div style={{background: 'var(--card-bg)', padding: '14px', borderRadius: '16px', position: 'relative', cursor: 'pointer'}} onClick={() => setShowNotifications(!showNotifications)}>
              <IconBell color="var(--primary)" />
              <div style={{position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%'}}></div>
            </div>
            <div className="profile-btn" onClick={() => setActiveTab('settings')}>
              <div className="app-meta">
                <p style={{fontSize: '14px', fontWeight: '700'}}>Pedro Castillo</p>
                <p style={{fontSize: '11px', color: 'var(--primary)'}}>Nivel Premium</p>
              </div>
              <div className="profile-img">P</div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-grid">
              <div className="glass-card">
                <div className="card-icon-box"><IconPhone /></div>
                <p className="card-label">Uso de Pantalla</p>
                <p className="card-value">2h 15m</p>
                <div style={{width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '10px'}}>
                  <div style={{width: '65%', height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))', borderRadius: '10px'}}></div>
                </div>
              </div>
              <div className="glass-card">
                <div className="card-icon-box" style={{color: 'var(--success)', background: 'rgba(0,255,157,0.1)'}}><IconMap /></div>
                <p className="card-label">Última Zona</p>
                <p className="card-value" style={{fontSize: '22px'}}>Colegio Delta</p>
                <p style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Visto hace 5 min</p>
              </div>
              <div className="glass-card">
                <div className="card-icon-box" style={{color: 'var(--danger)', background: 'rgba(255,51,102,0.1)'}}><IconShield /></div>
                <p className="card-label">Avisos de Riesgo</p>
                <p className="card-value">0</p>
                <p style={{fontSize: '12px', color: 'var(--success)'}}>Todo bajo control</p>
              </div>
            </div>

            <h2 className="section-title">Control de Aplicaciones</h2>
            <div className="apps-container">
              {appsData.map(app => (
                <div className="app-row" key={app.id}>
                  <div className="app-icon-circle" style={{background: app.bg + '33', color: app.bg}}>{renderIcon(app.iconName)}</div>
                  <div className="app-meta">
                    <p className="app-name">{app.name}</p>
                    <p className="app-type">{app.active ? 'Activa - ' + app.time : 'BLOQUEADA POR PADRE'}</p>
                  </div>
                  <div style={{marginRight: '24px'}}><span className="nav-item" onClick={() => handleLimitApp(app.name)} style={{padding: '8px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)'}}>Ajustar</span></div>
                  <label className="switch">
                    <input type="checkbox" checked={app.active} onChange={() => handleToggleApp(app.id)} />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'location' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div className="glass-card" style={{height: '450px', display: 'flex', flexDirection: 'column', padding: '16px'}}>
              <div style={{padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>Google Maps - Rastreo GPS</h3>
                <button className="btn-primary" style={{width: 'auto', padding: '10px 20px'}} onClick={addGeofence}>+ Zona Segura</button>
              </div>
              <div style={{flex: 1, background: '#000', borderRadius: '20px', overflow: 'hidden'}}>
                 <iframe 
                   width="100%" 
                   height="100%" 
                   frameBorder="0" 
                   style={{border:0}} 
                   src="https://www.google.com/maps/embed/v1/view?key=AIzaSyCKAhkNSvxQjtljohLR70q7xH7uskeyOvM&center=19.4326,-99.1332&zoom=14&maptype=roadmap" 
                   allowFullScreen>
                 </iframe>
              </div>
            </div>
            
            <h3 className="section-title">Geocercas Configuradas</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px'}}>
              {geofences.map(f => (
                <div key={f.id} className="glass-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <h4 style={{fontSize: '18px'}}>{f.name}</h4>
                    <p style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Radio: {f.radius} • {f.active ? 'Vigilando' : 'Inactiva'}</p>
                  </div>
                  <button onClick={() => removeGeofence(f.id)} style={{background: 'rgba(255,51,102,0.1)', border: 'none', padding: '10px', borderRadius: '12px', color: 'var(--danger)', cursor: 'pointer'}}><IconTrash size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
            <div className="glass-card">
              <h3>Filtro de Contenido Web</h3>
              <p style={{color: 'var(--text-secondary)', fontSize: '14px', margin: '12px 0 24px'}}>Bloquea sitios web específicos de manera instantánea.</p>
              <form onSubmit={handleAddUrl} style={{display: 'flex', gap: '12px'}}>
                <input className="input-field" placeholder="ej: tiktok.com" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                <button className="btn-primary" style={{width: '120px'}}><IconPlus /></button>
              </form>
            </div>

            <div className="glass-card">
              <h3 style={{marginBottom: '20px'}}>Sitios en Lista Negra</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {blockedUrls.map(url => (
                  <div key={url} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid var(--border)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}><IconGlobe size={20} color="var(--danger)" /> <span>{url}</span></div>
                    <button onClick={() => removeUrl(url)} style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}><IconTrash size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="dashboard-grid">
            <div className="glass-card">
              <h3>PIN de Acceso</h3>
              <div className="input-group" style={{marginTop: '24px'}}>
                <span className="input-label">Actualizar código maestro</span>
                <input className="input-field" type="password" placeholder="4 dígitos" onBlur={(e) => {
                  if (e.target.value.length === 4) { setParentPin(e.target.value); alert('PIN actualizado.'); }
                }} />
              </div>
              <button className="btn-primary" style={{marginTop: '16px'}} onClick={() => signOut(auth).then(() => setCurrentRoute('onboard'))}>Cerrar Sesión Segura</button>
            </div>
            <div className="glass-card" style={{border: '1px solid var(--danger)'}}>
              <h3 style={{color: 'var(--danger)'}}>Restablecimiento</h3>
              <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px'}}>Esta acción desvinculará este teléfono y eliminará todo el historial de rastro.</p>
              <button className="btn-lock" style={{marginTop: '24px', fontSize: '14px', padding: '14px'}}>Borrar Configuración</button>
            </div>
          </div>
        )}

        {/* FAB for Mobile Quick Total Lock */}
        <button className={`btn-lock mobile-lock-fab ${deviceLocked ? 'unlocked' : ''}`} onClick={handleToggleDeviceLock}>
          {deviceLocked ? <IconUnlock size={30} /> : <IconLock size={30} />}
        </button>
      </main>
    </div>
  );
}

export default App;
