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
const IconKey = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>;
const IconUser = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconPlay = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IconGame = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>;
const IconTrash = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

function App() {
  const [currentRoute, setCurrentRoute] = useLocalStorage('appRoute', 'onboard');
  const [deviceLocked, setDeviceLocked] = useLocalStorage('deviceLocked', false);
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'dashboard');
  const [parentPin, setParentPin] = useLocalStorage('parentPin', null);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [appsData, setAppsData] = useLocalStorage('appsData', [
    {id: 1, name: 'YouTube', type: 'Entretenimiento', bg: '#FF0000', time: 'Acceso Total', active: true, icon: <IconPlay />},
    {id: 2, name: 'Roblox', type: 'Juegos', bg: '#00FF9D', time: '1h diaria', active: true, icon: <IconGame />},
    {id: 3, name: 'Google Chrome', type: 'Filtro Activo', bg: '#00F0FF', time: 'Seguro', active: true, icon: <IconGlobe />}
  ]);

  const [geofences, setGeofences] = useLocalStorage('geofences', [
    { id: 1, name: 'Escuela Primaria', radius: '500m', active: true },
    { id: 2, name: 'Casa', radius: '200m', active: false }
  ]);

  const [blockedUrls, setBlockedUrls] = useLocalStorage('blockedUrls', ['pornhub.com', 'casino.com']);
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

  const handleToggleDeviceLock = () => {
    setDeviceLocked(!deviceLocked);
  };

  const handleToggleApp = (id) => {
    setAppsData(appsData.map(app => 
      app.id === id ? { ...app, active: !app.active, time: !app.active ? 'Restaurado' : 'Bloqueado' } : app
    ));
  };

  const addGeofence = () => {
    const name = window.prompt("Nombre de la zona segura:");
    if (name) setGeofences([...geofences, { id: Date.now(), name, radius: "300m", active: true }]);
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

  // --- Screens ---

  if (isSessionLocked) {
    return (
      <div className="auth-wrapper">
        <div className="glass-card auth-card" style={{textAlign: 'center'}}>
          <IconLock size={60} color="var(--danger)" style={{marginBottom: '20px'}} />
          <h2>Panel Bloqueado</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '30px'}}>Ingresa tu PIN de seguridad</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const pin = Array.from(e.target.elements).filter(el => el.tagName === 'INPUT').map(el => el.value).join('');
            if (pin === parentPin) setIsSessionLocked(false);
            else alert('Pin incorrecto');
          }} style={{display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px'}}>
            {[1,2,3,4].map(i => <input key={i} type="password" maxLength="1" className="input-field" style={{width: '50px', textAlign: 'center', fontSize: '24px'}} required />)}
            <div style={{width: '100%', marginTop: '20px'}}><button className="btn-primary">Desbloquear</button></div>
          </form>
        </div>
      </div>
    );
  }

  if (currentRoute === 'onboard') {
    return (
      <div className="auth-wrapper" style={{flexDirection: 'column'}}>
        <IconShield size={100} color="var(--primary)" style={{marginBottom: '20px'}} />
        <h1 style={{fontSize: '40px', fontWeight: '800', marginBottom: '10px'}}>NiñoSafe</h1>
        <p style={{color: 'var(--text-secondary)', marginBottom: '40px'}}>Seguridad digital total para tu familia</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%', maxWidth: '700px'}}>
          <div className="glass-card" style={{cursor: 'pointer', textAlign: 'center'}} onClick={() => setCurrentRoute('parent_login')}>
            <IconUser size={48} color="var(--primary)" style={{margin: '0 auto 15px'}} />
            <h3>Perfil Padre</h3>
            <p style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Controla límites y ubicación</p>
          </div>
          <div className="glass-card" style={{cursor: 'pointer', textAlign: 'center', borderTop: '2px solid var(--accent)'}} onClick={() => setCurrentRoute('child_pair')}>
            <IconPhone size={48} color="var(--accent)" style={{margin: '0 auto 15px'}} />
            <h3>Perfil Niño</h3>
            <p style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Dispositivo supervisado</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentRoute === 'parent_login') {
    return (
      <div className="auth-wrapper">
        <div className="glass-card auth-card">
          <div style={{textAlign: 'center', marginBottom: '30px'}}><IconShield size={40} color="var(--primary)" /><h2>{authMode === 'login' ? 'Iniciar Sesión' : 'Crea tu Cuenta'}</h2></div>
          {authError && <div style={{color: 'var(--danger)', marginBottom: '15px'}}>{authError}</div>}
          <form onSubmit={handleFirebaseLogin}>
            <div className="input-group"><span className="input-label">Email</span><input className="input-field" type="email" value={emailValue} onChange={e => setEmailValue(e.target.value)} required /></div>
            <div className="input-group"><span className="input-label">Contraseña</span><input className="input-field" type="password" value={passValue} onChange={e => setPassValue(e.target.value)} required /></div>
            <button className="btn-primary" type="submit">{isAuthLoading ? '...' : (authMode === 'login' ? 'Entrar' : 'Registrar')}</button>
            <button className="btn-google" type="button" onClick={handleGoogleLogin}>Continuar con Google</button>
            <p onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} style={{textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: var(--primary)}}>
              {authMode === 'login' ? '¿No tienes cuenta? Registrate' : '¿Ya tienes cuenta? Entra'}
            </p>
            <div style={{textAlign: 'center', marginTop: '20px'}}><span onClick={() => setCurrentRoute('onboard')} style={{cursor: 'pointer', color: 'var(--text-secondary)'}}>← Volver</span></div>
          </form>
        </div>
      </div>
    );
  }

  if (currentRoute === 'child_pair') {
    return (
      <div className="auth-wrapper">
        <div className="glass-card auth-card" style={{textAlign: 'center'}}>
          <IconShield size={80} color="var(--accent)" style={{marginBottom: '20px'}} />
          <h2>Modo Niño Activo</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '30px'}}>Este dispositivo está siendo protegido por NiñoSafe.</p>
          <div style={{padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', marginBottom: '30px'}}>
            <p style={{fontSize: '12px'}}>ID del Dispositivo: <b>SAF-992-X</b></p>
          </div>
          <button className="btn-primary" style={{background: 'transparent', border: '1px solid white', color: 'white'}} onClick={() => setCurrentRoute('onboard')}>Salir del Modo Niño</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar / Bottom Nav */}
      <aside className="sidebar">
        <div className="brand">
          <IconShield className="brand-icon" size={32} />
          <span className="brand-text">NiñoSafe</span>
        </div>
        <nav className="nav-links">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><IconDash /> <span>Panel</span></div>
          <div className={`nav-item ${activeTab === 'location' ? 'active' : ''}`} onClick={() => setActiveTab('location')}><IconMap /> <span>Rastreo</span></div>
          <div className={`nav-item ${activeTab === 'apps' ? 'active' : ''}`} onClick={() => setActiveTab('apps')}><IconPhone /> <span>Web</span></div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><IconSet /> <span>Ajustes</span></div>
        </nav>
        <div className="lock-sidebar-container">
          <button className={`btn-lock ${deviceLocked ? 'unlocked' : ''}`} onClick={handleToggleDeviceLock}>
            {deviceLocked ? <IconUnlock /> : <IconLock />} <span>{deviceLocked ? 'Desbloquear' : 'Corte Total'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>{activeTab === 'dashboard' ? 'Protección Activa' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p>Monitoreando dispositivo: <b>Galaxy Tab S9</b></p>
          </div>
          <div className="header-actions">
            <div style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '14px', cursor: 'pointer'}} onClick={() => setShowNotifications(!showNotifications)}>
              <IconBell color="var(--primary)" />
            </div>
            <div className="profile-btn" onClick={() => setActiveTab('settings')}>
              <div className="app-meta">
                <p style={{fontSize: '14px', fontWeight: '600'}}>Padre Demo</p>
                <p style={{fontSize: '11px', color: 'var(--text-secondary)'}}>Plan Premium</p>
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
                <p className="card-label">Tiempo Restante</p>
                <p className="card-value">01:45:00</p>
                <div style={{width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px'}}>
                  <div style={{width: '70%', height: '100%', background: 'var(--primary)', borderRadius: '2px'}}></div>
                </div>
              </div>
              <div className="glass-card">
                <div className="card-icon-box" style={{color: 'var(--success)', background: 'rgba(0,255,157,0.1)'}}><IconMap /></div>
                <p className="card-label">Ubicación</p>
                <p className="card-value" style={{fontSize: '20px'}}>Av. Central #44</p>
                <p style={{fontSize: '12px', color: 'var(--success)'}}>● En línea ahora</p>
              </div>
              <div className="glass-card">
                <div className="card-icon-box" style={{color: 'var(--accent)', background: 'rgba(138,43,226,0.1)'}}><IconShield /></div>
                <p className="card-label">Apps Bloqueadas</p>
                <p className="card-value">12</p>
                <p style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Intentos hoy: 4</p>
              </div>
            </div>

            <h2 className="section-title">Actividad Reciente</h2>
            <div className="apps-container">
              {appsData.map(app => (
                <div className="app-row" key={app.id}>
                  <div className="app-icon-circle" style={{background: app.bg + '44', color: app.bg}}>{app.icon}</div>
                  <div className="app-meta">
                    <p className="app-name">{app.name}</p>
                    <p className="app-type">{app.type}</p>
                  </div>
                  <div style={{textAlign: 'right', marginRight: '20px'}}>
                    <p style={{fontSize: '14px', fontWeight: '600', color: app.active ? 'var(--primary)' : 'var(--danger)'}}>{app.time}</p>
                  </div>
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
          <div className="glass-card" style={{height: '500px', display: 'flex', flexDirection: 'column'}}>
            <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3>Mapa en Tiempo Real</h3>
              <button className="btn-primary" style={{width: 'auto', padding: '8px 20px'}} onClick={addGeofence}>+ Zona Segura</button>
            </div>
            <div style={{flex: 1, background: '#000', borderRadius: '15px', overflow: 'hidden', position: 'relative'}}>
              <iframe width="100%" height="100%" frameBorder="0" src="https://www.openstreetmap.org/export/embed.html?bbox=-100,18,-98,20&layer=mapnik" style={{filter: 'invert(90%) hue-rotate(180deg)'}}></iframe>
            </div>
            <div style={{marginTop: '20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px'}}>
              {geofences.map(f => (
                <div key={f.id} style={{padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: f.active ? '1px solid var(--success)' : '1px solid var(--border)', flexShrink: 0}}>
                  <p style={{fontSize: '14px'}}>{f.name}</p>
                  <p style={{fontSize: '11px', color: 'var(--text-secondary)'}}>{f.radius}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="dashboard-grid">
            <div className="glass-card">
              <h3>Seguridad del Panel</h3>
              <div className="input-group" style={{marginTop: '20px'}}>
                <span className="input-label">Cambiar PIN</span>
                <input className="input-field" type="password" placeholder="Nuevo PIN 4 digitos" onBlur={(e) => {
                  if (e.target.value.length === 4) setParentPin(e.target.value);
                }} />
              </div>
              <button className="btn-primary" style={{marginTop: '10px'}} onClick={() => signOut(auth).then(() => setCurrentRoute('onboard'))}>Cerrar Sesión</button>
            </div>
            <div className="glass-card" style={{border: '1px solid var(--danger)'}}>
              <h3 style={{color: 'var(--danger)'}}>Zona de Riesgo</h3>
              <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginTop: '10px'}}>Borrar todos los datos de supervisión de este dispositivo.</p>
              <button className="btn-lock" style={{marginTop: '20px', fontSize: '14px', padding: '12px'}}>Eliminar Dispositivo</button>
            </div>
          </div>
        )}

        {/* FAB for Mobile */}
        <button className={`btn-lock mobile-lock-fab ${deviceLocked ? 'unlocked' : ''}`} onClick={handleToggleDeviceLock}>
          {deviceLocked ? <IconUnlock /> : <IconLock />}
        </button>
      </main>
    </div>
  );
}

export default App;
