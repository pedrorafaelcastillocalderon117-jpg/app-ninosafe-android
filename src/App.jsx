import React, { useState, useEffect } from 'react';
import './index.css';
import { auth } from './firebase';
import { registerPlugin } from '@capacitor/core';
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

// Registro del Plugin Nativo para Escaneo de Apps
const AppScanner = registerPlugin('AppScanner');

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
const IconRefresh = ({ size=24, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;

function App() {
  const [currentRoute, setCurrentRoute] = useLocalStorage('appRoute', 'onboard');
  const [deviceLocked, setDeviceLocked] = useLocalStorage('deviceLocked', false);
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'dashboard');
  const [parentPin, setParentPin] = useLocalStorage('parentPin', null);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [appsData, setAppsData] = useLocalStorage('appsData', [
    {id: 1, name: 'YouTube', packageName: 'com.google.android.youtube', type: 'Entretenimiento', bg: '#FF0000', time: 'Acceso Total', active: true, iconName: 'play'},
    {id: 2, name: 'Roblox', packageName: 'com.roblox.client', type: 'Juegos', bg: '#00FF9D', time: '1h diaria', active: true, iconName: 'game'},
    {id: 3, name: 'Chrome', packageName: 'com.android.chrome', type: 'Seguro', bg: '#00F0FF', time: 'Filtrado', active: true, iconName: 'globe'}
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

  const handleToggleApp = (packageName) => {
    setAppsData(appsData.map(app => 
      app.packageName === packageName ? { ...app, active: !app.active, time: !app.active ? 'Restaurado' : 'BLOQUEADO' } : app
    ));
  };

  const handleScanApps = async () => {
    setIsScanning(true);
    try {
      const result = await AppScanner.getInstalledApps();
      if (result && result.apps) {
        const newApps = result.apps.map((a, idx) => ({
          id: Date.now() + idx,
          name: a.name,
          packageName: a.packageName,
          type: 'App Instalada',
          bg: '#4facfe',
          time: 'Sin limites',
          active: true,
          iconName: 'phone'
        }));
        
        // Mantener las existentes y agregar las nuevas que no estén
        const merged = [...appsData];
        newApps.forEach(na => {
          if (!merged.find(ma => ma.packageName === na.packageName)) {
            merged.push(na);
          }
        });
        setAppsData(merged);
        alert(`¡Escaneo completo! Se encontraron ${result.apps.length} aplicaciones.`);
      }
    } catch (e) {
      console.error(e);
      alert('Error nativo: Solo funciona en el dispositivo Android real.');
    }
    setIsScanning(false);
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
    } catch (err) { setAuthError(err.message); }
    setIsAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    try { await signInWithRedirect(auth, new GoogleAuthProvider()); } 
    catch (err) { setAuthError(err.message); setIsAuthLoading(false); }
  };

  if (isSessionLocked) {
    return (
      <div className="auth-wrapper">
        <div className="glass-card auth-card" style={{textAlign: 'center'}}>
          <IconLock size={60} color="var(--danger)" style={{marginBottom: '20px'}} />
          <h2>Bloqueo Parental</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const pin = Array.from(e.target.elements).filter(el => el.tagName === 'INPUT').map(el => el.value).join('');
            if (pin === parentPin) setIsSessionLocked(false);
            else alert('PIN Incorrecto');
          }} style={{display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap'}}>
            {[1,2,3,4].map(i => <input key={i} type="password" maxLength="1" className="input-field" style={{width: '60px', textAlign: 'center', fontSize: '24px'}} required />)}
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
        <h1>NiñoSafe</h1>
        <p style={{color: 'var(--text-secondary)', marginBottom: '48px'}}>Ecosistema de Seguridad Familiar</p>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', width: '100%', maxWidth: '800px'}}>
          <div className="glass-card" style={{cursor: 'pointer', textAlign: 'center'}} onClick={() => setCurrentRoute('parent_login')}><IconUser size={56} color="var(--primary)" style={{margin: '0 auto 16px'}} /><h2>Modo Padre</h2></div>
          <div className="glass-card" style={{cursor: 'pointer', textAlign: 'center', borderTop: '4px solid var(--accent)'}} onClick={() => setCurrentRoute('child_pair')}><IconPhone size={56} color="var(--accent)" style={{margin: '0 auto 16px'}} /><h2>Modo Niño</h2></div>
        </div>
      </div>
    );
  }

  if (currentRoute === 'parent_login') {
    return (
      <div className="auth-wrapper">
        <div className="glass-card auth-card">
          <div style={{textAlign: 'center', marginBottom: '32px'}}><IconShield size={48} color="var(--primary)" /><h2>Acceso Parental</h2></div>
          <form onSubmit={handleFirebaseLogin}>
            <div className="input-group"><span className="input-label">Email</span><input className="input-field" type="email" value={emailValue} onChange={e => setEmailValue(e.target.value)} required /></div>
            <div className="input-group"><span className="input-label">Contraseña</span><input className="input-field" type="password" value={passValue} onChange={e => setPassValue(e.target.value)} required /></div>
            <button className="btn-primary" type="submit">{isAuthLoading ? '...' : 'Entrar'}</button>
            <button className="btn-google" type="button" onClick={handleGoogleLogin}>Google Login</button>
            <p onClick={() => setAuthMode('register')} style={{textAlign: 'center', marginTop: '24px', cursor: 'pointer', color: 'var(--primary)'}}>Crear cuenta nueva</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand"><IconShield size={36} /><span className="brand-text">NiñoSafe</span></div>
        <nav className="nav-links">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><IconDash /> <span>Apps</span></div>
          <div className={`nav-item ${activeTab === 'location' ? 'active' : ''}`} onClick={() => setActiveTab('location')}><IconMap /> <span>GPS</span></div>
          <div className={`nav-item ${activeTab === 'apps' ? 'active' : ''}`} onClick={() => setActiveTab('apps')}><IconGlobe /> <span>Web</span></div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><IconSet /> <span>Ajustes</span></div>
        </nav>
        <button className={`btn-lock ${deviceLocked ? 'unlocked' : ''}`} onClick={handleToggleDeviceLock} style={{margin: 'auto 20px 20px', width: 'auto'}}>{deviceLocked ? <IconUnlock /> : <IconLock />}</button>
      </aside>

      <main className="main-content">
        <header className="header" style={{marginBottom: '20px'}}>
          <h1>{activeTab.toUpperCase()}</h1>
          <div className="header-actions">
            <button className="btn-primary" style={{width: 'auto', padding: '10px 20px', gap: '8px'}} onClick={handleScanApps}>{isScanning ? '...' : <IconRefresh size={18} />} Escanear Todo</button>
            <div className="profile-img">P</div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="apps-container">
            {appsData.map(app => (
              <div className="app-row" key={app.packageName}>
                <div className="app-icon-circle" style={{background: app.bg + '33', color: app.bg}}>{renderIcon(app.iconName)}</div>
                <div className="app-meta"><p className="app-name">{app.name}</p><p className="app-type">{app.packageName}</p></div>
                <div style={{marginRight: '20px', color: app.active ? 'var(--primary)' : 'var(--danger)', fontWeight: '700'}}>{app.active ? 'PERMITIDO' : 'BLOQUEADO'}</div>
                <label className="switch"><input type="checkbox" checked={app.active} onChange={() => handleToggleApp(app.packageName)} /><span className="slider"></span></label>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'location' && (
          <div className="glass-card" style={{height: '500px', padding: '10px'}}>
             <iframe width="100%" height="100%" frameBorder="0" style={{borderRadius: '15px'}} src="https://maps.google.com/maps?q=19.4326,-99.1332&z=15&output=embed"></iframe>
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="glass-card">
            <h3>Filtro Web</h3>
            <form onSubmit={handleAddUrl} style={{display: 'flex', gap: '10px', marginTop: '20px'}}><input className="input-field" value={newUrl} onChange={e => setNewUrl(e.target.value)} /><button className="btn-primary" style={{width: '60px'}}><IconPlus /></button></form>
            <div style={{marginTop: '20px'}}>{blockedUrls.map(u => <div key={u} className="app-row" style={{marginBottom: '8px'}}><span>{u}</span><button onClick={() => removeUrl(u)} className="btn-lock" style={{width: 'auto', padding: '8px'}}><IconTrash size={16} /></button></div>)}</div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass-card">
            <h3>Seguridad</h3>
            <button className="btn-primary" style={{marginTop: '20px'}} onClick={() => signOut(auth).then(() => setCurrentRoute('onboard'))}>Log Out</button>
          </div>
        )}

        <button className={`btn-lock mobile-lock-fab ${deviceLocked ? 'unlocked' : ''}`} onClick={handleToggleDeviceLock}>{deviceLocked ? <IconUnlock /> : <IconLock />}</button>
      </main>
    </div>
  );
}

export default App;
