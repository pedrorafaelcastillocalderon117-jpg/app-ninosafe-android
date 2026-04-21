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

// SVG Icons
const IconShield = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>;
const IconDash = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>;
const IconMap = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconPhone = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
const IconGlobe = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const IconSet = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconBell = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconLock = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconUnlock = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>;
const IconKey = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>;
const IconPlay = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IconGame = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>;
const IconImg = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const IconSearch = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconTrash = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconUser = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconLink = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
const IconCreditCard = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const IconTarget = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;

function App() {
  // Persistencia de Rutas y Configuraciones
  const [currentRoute, setCurrentRoute] = useLocalStorage('appRoute', 'onboard');
  const [deviceLocked, setDeviceLocked] = useLocalStorage('deviceLocked', false);
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'dashboard');
  
  // Persistencia del PIN
  const [parentPin, setParentPin] = useLocalStorage('parentPin', null);
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  // Estados Locales Nuevos (Fase Final Visual)
  const [showNotifications, setShowNotifications] = useState(false);
  const [geofences, setGeofences] = useLocalStorage('geofences', [
    { id: 1, name: 'Escuela Primaria', radius: '500m', active: true },
    { id: 2, name: 'Casa de Abuelos', radius: '200m', active: false }
  ]);

  // Configuración persistente del dashboard
  const [blockedUrls, setBlockedUrls] = useLocalStorage('blockedUrls', ['pornhub.com', 'casino.com']);
  const [newUrl, setNewUrl] = useState('');
  
  const [appsData, setAppsData] = useLocalStorage('appsData', [
    {id: 1, name: 'YouTube', type: 'Entretenimiento', bg: '#FF0000', time: 'Acceso Total', active: true},
    {id: 2, name: 'Roblox', type: 'Juegos', bg: '#00FF9D', time: 'Límite: 1 hora diaria', active: true},
    {id: 3, name: 'Instagram', type: 'Red Social', bg: '#8A2BE2', time: 'Bloqueado (Restringido)', active: false},
    {id: 4, name: 'Google Chrome', type: 'Navegador Seguro', bg: '#00F0FF', time: 'Filtro Activo', active: true},
    {id: 5, name: 'Ajustes del Teléfono', type: 'Sistema Android', bg: '#333', time: 'Protegido con Contraseña', active: true}
  ]);
  
  const [switches, setSwitches] = useLocalStorage('netSwitches', { safeSearch: true, adult: true, malware: true });

  // === ESTADOS DE FIREBASE ===
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [passValue, setPassValue] = useState('');

  // Listener global para saber si alguien inició sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Capturar el resultado del Login con Google al regresar del navegador (Android Fix)
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          setCurrentUser(result.user);
          setCurrentRoute('dashboard');
          setActiveTab('dashboard');
        }
      })
      .catch((error) => {
        console.error("Error en redirect de Google:", error);
      });

    return () => unsubscribe();
  }, []);

  const [hoveredBar, setHoveredBar] = useState(null);
  const trafficData = [
    { time: '6:00 AM', mb: 20, desc: 'Poco uso (Fondo)' }, { time: '8:00 AM', mb: 45, desc: 'Noticias/Apps' },
    { time: '10:00 AM', mb: 30, desc: 'Clases / Zoom' }, { time: '11:00 AM', mb: 90, desc: 'YouTube' },
    { time: '1:00 PM', mb: 60, desc: 'Navegación' }, { time: '3:00 PM', mb: 80, desc: 'Roblox (Juego)' },
    { time: '4:00 PM', mb: 15, desc: 'Poco uso' }, { time: '6:00 PM', mb: 50, desc: 'Redes Sociales' },
    { time: '7:00 PM', mb: 75, desc: 'YouTube' }, { time: '8:00 PM', mb: 40, desc: 'Navegación' },
    { time: '10:00 PM', mb: 10, desc: 'Inactivo' }, { time: 'Ahora', mb: 85, desc: 'Roblox (Juego)' }
  ];

  // Efecto de Validación de PIN
  useEffect(() => {
    if (currentRoute === 'dashboard' || activeTab) {
      if (parentPin !== null) { setIsSessionLocked(true); }
    }
  }, []);

  const handleToggleDeviceLock = () => {
    setDeviceLocked(!deviceLocked);
    alert(deviceLocked ? 'Atención: Has desbloqueado el teléfono.' : '🚨 Teléfono bloqueado instantáneamente.');
  };

  const handleToggleApp = (id) => {
    setAppsData(appsData.map(app => {
      if (app.id === id) {
        const newActive = !app.active;
        return { ...app, active: newActive, time: newActive ? 'Restaurado' : 'Bloqueado por el Padre' };
      }
      return app;
    }));
  };

  const handleLimitApp = (appName) => {
    const newLimit = window.prompt(`Establecer límite de diario para ${appName} (ej. 60 para 1 hora, 0 para bloquear)`, '');
    if (newLimit !== null) alert(`Límite guardado: ${newLimit} minutos.`);
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (newUrl && !blockedUrls.includes(newUrl)) {
      setBlockedUrls([...blockedUrls, newUrl]);
      setNewUrl('');
    }
  };

  const removeUrl = (urlToRemove) => setBlockedUrls(blockedUrls.filter(url => url !== urlToRemove));

  const getIconForApp = (id) => {
     switch(id) {
        case 1: return <IconPlay color="#FFF" />;
        case 2: return <IconGame color="#000" />;
        case 3: return <IconImg color="#FFF" />;
        case 4: return <IconGlobe color="#000" />;
        default: return <IconSet color="#FFF" />;
     }
  };

  // -------------------------
  // FUNCIONES DE FIREBASE
  // -------------------------
  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    if (authMode === 'register') {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailValue, passValue);
        // Mandamos correo
        await sendEmailVerification(userCredential.user);
        alert('¡Cuenta creada! Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.');
        
        await signOut(auth); // Lo cerramos forzosamente hasta que verifique
        setAuthMode('login');
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') setAuthError('Este correo ya está registrado.');
        else if (err.code === 'auth/weak-password') setAuthError('La contraseña debe tener al menos 6 caracteres.');
        else setAuthError('Error al crear la cuenta: ' + err.message);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailValue, passValue);
        
        // Verificación de Guardia
        if (!userCredential.user.emailVerified) {
           await signOut(auth);
           setAuthError('Tu correo aún no está verificado. Revisa tu bandeja de entrada o SPAM.');
           setIsAuthLoading(false);
           return;
        }

        // Éxito: correo validado
        setCurrentUser(userCredential.user);
        setCurrentRoute('dashboard');
        setActiveTab('dashboard');
      } catch (err) {
        if (err.code === 'auth/invalid-credential') setAuthError('Correo o contraseña incorrectos.');
        else setAuthError('Error de acceso: ' + err.message);
      }
    }
    
    setIsAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // Firebase para Android en WebView requiere Redirect en vez de Popup
      await signInWithRedirect(auth, provider);
    } catch (err) {
      setAuthError('Error al iniciar redirección: ' + err.message);
      setIsAuthLoading(false);
    }
  };

  const handleLogoutReal = async () => {
    await signOut(auth);
    setCurrentRoute('onboard');
    setParentPin(null);
  };

  // -------------------------
  // FLUJOS SECUNDARIOS
  // -------------------------
  if (isSessionLocked) {
    return (
      <div style={{height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(5,5,16,0.95)', backdropFilter: 'blur(10px)'}}>
        <div className="card glass-panel" style={{width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px 24px'}}>
          <IconLock size={56} color="var(--danger)" style={{margin: '0 auto 24px'}} />
          <h2 style={{marginBottom: '12px', fontSize: '28px'}}>Panel Protegido</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '32px'}}>Ingresa el PIN numérico de seguridad.</p>
          <form onSubmit={(e) => { 
            e.preventDefault();
            const inputs = Array.from(e.target.elements).filter(el => el.tagName === 'INPUT').map(el => el.value).join('');
            if (inputs === parentPin) setIsSessionLocked(false);
            else { alert('PIN Incorrecto.'); e.target.reset(); }
          }}>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px'}}>
              {[1,2,3,4].map(i => (
                <input required key={i} type="password" maxLength="1" style={{width: '60px', height: '60px', textAlign: 'center', fontSize: '32px', background: 'rgba(0,0,0,0.4)', border: '2px solid var(--panel-border)', borderRadius: '12px', color: 'white', fontFamily: 'var(--font-main)'}} />
              ))}
            </div>
            <button type="submit" style={{width: '100%', padding: '16px', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer'}}>Desbloquear App</button>
            <button type="button" onClick={() => { setCurrentRoute('onboard'); setIsSessionLocked(false); setParentPin(null); }} style={{background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginTop: '24px'}}>Reinstalar App (Borra Restricciones)</button>
          </form>
        </div>
      </div>
    );
  }

  if (currentRoute === 'onboard') {
    return (
      <div style={{height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'}}>
        <IconShield size={80} color="var(--primary)" />
        <h1 style={{fontSize: '48px', margin: '24px 0 8px 0'}}>NiñoSafe</h1>
        <p style={{color: 'var(--text-muted)', fontSize: '20px', marginBottom: '48px'}}>¿Quién está usando actualmente este dispositivo?</p>
        <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center'}}>
          <div className="card glass-panel" style={{width: '280px', textAlign: 'center', cursor: 'pointer', borderTop: '4px solid var(--primary)'}} onClick={() => setCurrentRoute('parent_login')}>
            <IconUser size={64} color="var(--primary)" style={{margin: '0 auto 16px'}} />
            <h2 style={{marginBottom: '8px'}}>Soy el Padre</h2>
          </div>
          <div className="card glass-panel" style={{width: '280px', textAlign: 'center', cursor: 'pointer', borderTop: '4px solid var(--secondary)'}} onClick={() => setCurrentRoute('child_pair')}>
            <IconPhone size={64} color="var(--secondary)" style={{margin: '0 auto 16px'}} />
            <h2 style={{marginBottom: '8px'}}>Soy el Niño</h2>
          </div>
        </div>
      </div>
    );
  }

  if (currentRoute === 'parent_login') {
    return (
      <div style={{height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="card glass-panel" style={{width: '100%', maxWidth: '400px', padding: '32px'}}>
          <div style={{textAlign: 'center', marginBottom: '24px'}}><IconShield size={40} color="var(--primary)" style={{marginBottom: '16px'}} /><h2>Cuenta de Padre</h2></div>
          
          {authError && <div style={{background: 'rgba(255,51,102,0.1)', border: '1px solid var(--danger)', padding: '12px', color: 'var(--danger)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', textAlign: 'center'}}>{authError}</div>}

          <form onSubmit={handleFirebaseLogin} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <input type="email" placeholder="Correo Electrónico" value={emailValue} onChange={e => setEmailValue(e.target.value)} style={{padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '12px', color: 'white'}} required />
            <input type="password" placeholder="Contraseña (Mín. 6 char)" value={passValue} onChange={e => setPassValue(e.target.value)} style={{padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '12px', color: 'white'}} required />
            
            <button type="submit" disabled={isAuthLoading} style={{padding: '16px', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: isAuthLoading ? 0.7 : 1}}>
              {isAuthLoading ? 'Procesando...' : (authMode === 'login' ? 'Iniciar Sesión' : 'Registrarme y Enviar Código')}
            </button>

            <div style={{display: 'flex', alignItems: 'center', margin: '4px 0'}}>
              <div style={{flex: 1, height: '1px', background: 'var(--panel-border)'}}></div>
              <span style={{margin: '0 12px', color: 'var(--text-muted)', fontSize: '12px'}}>O</span>
              <div style={{flex: 1, height: '1px', background: 'var(--panel-border)'}}></div>
            </div>

            <button type="button" onClick={handleGoogleLogin} disabled={isAuthLoading} style={{padding: '14px', background: 'white', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isAuthLoading ? 0.7 : 1}}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </button>
            
            <div style={{textAlign: 'center', marginTop: '4px'}}>
               <span style={{color: 'var(--text-muted)', fontSize: '14px'}}>
                 {authMode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
               </span>
               <span onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} style={{color: 'var(--primary)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'}}>
                 {authMode === 'login' ? 'Crea una aquí.' : 'Inicia sesión.'}
               </span>
            </div>

            <button type="button" onClick={() => setCurrentRoute('onboard')} style={{background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '12px'}}>&larr; Salir al Inicio</button>
          </form>
        </div>
      </div>
    );
  }

  if (currentRoute === 'child_pair') {
     return (
       <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
         <div className="card glass-panel" style={{width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px'}}><h2 style={{color: 'var(--secondary)'}}>Panel Oculto (Modo Niño Activo)</h2><button onClick={() => setCurrentRoute('onboard')} style={{marginTop: '20px', padding: '10px 20px', background: 'transparent', border: '1px solid white', color: 'white', borderRadius: '8px', cursor: 'pointer'}}>Resetear Estado</button></div>
       </div>
     );
  }

  // -------------------------
  // RENDER PESTAÑAS (TABS)
  // -------------------------
  const renderDashboard = () => (
    <>
      <div className="dashboard-grid">
        <div className="card glass-panel">
          <div className="card-header"><span>Uso Diario Restante</span><IconPhone className="card-icon" size={32} color="var(--primary)" /></div>
          <div className="card-value">1h 45m</div><div className="card-footer" style={{color: 'var(--text-muted)'}}><span>De un límite total de 6h</span></div>
        </div>
        <div className="card glass-panel" style={{position: 'relative', overflow: 'hidden', cursor: 'pointer'}} onClick={() => setActiveTab('location')}>
          <div style={{position: 'absolute', right: '-30px', top: '15px', background: 'var(--success)', color: '#000', padding: '4px 32px', transform: 'rotate(45deg)', fontSize: '12px', fontWeight: 'bold'}}>EN LÍNEA</div>
          <div className="card-header"><span>Última Ubicación</span><IconMap className="card-icon" size={32} color="var(--primary)"/></div>
          <div className="card-value" style={{fontSize: '24px', marginTop: '16px'}}>Parque Central</div><div className="card-footer" style={{color: 'var(--success)'}}><span>Ir al mapa &rarr;</span></div>
        </div>
        <div className="card glass-panel" style={{cursor: 'pointer', border: '1px dashed var(--secondary)', background: 'transparent'}} onClick={() => {
           const newPin = window.prompt("Crear/Cambiar PIN de 4 dígitos para esta App:", parentPin || "");
           if (newPin && newPin.length === 4 && !isNaN(newPin)) { setParentPin(newPin); alert("PIN establecido."); }
        }}>
          <div style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'}}>
            <IconKey size={32} color="var(--secondary)" />
            <h4 style={{color: 'var(--secondary)', fontSize: '18px'}}>Bloqueo del Panel</h4>
            <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>{parentPin ? 'PIN Activo: ****' : 'Configurar PIN'}</span>
          </div>
        </div>
      </div>
      <div className="dashboard-grid" style={{gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)'}}>
        <div className="card glass-panel" style={{height: '350px'}}>
          <div className="card-header" style={{marginBottom: '16px'}}>
            <span>Tráfico de Internet</span>{hoveredBar && <span style={{color: 'var(--primary)'}}>{hoveredBar.time}: {hoveredBar.mb} MB</span>}
          </div>
          <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px 0', position: 'relative'}}>
             {trafficData.map((data, i) => (
               <div key={i} onMouseEnter={() => setHoveredBar(data)} onMouseLeave={() => setHoveredBar(null)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8%', height: '100%', justifyContent: 'flex-end', position: 'relative', cursor: 'pointer' }}>
                 {hoveredBar === data && (
                   <div style={{position: 'absolute', top: `-${100 - data.mb}%`, background: 'var(--bg-color)', border: '1px solid var(--primary)', padding: '6px 10px', borderRadius: '8px', zIndex: 10, color: 'white', fontSize: '12px', whiteSpace: 'nowrap', transform: 'translateY(-30px)'}}>
                     <strong style={{display: 'block', color: 'var(--primary)'}}>{data.mb} MB</strong><span>{data.desc}</span>
                   </div>
                 )}
                 <div style={{ background: hoveredBar === data ? 'var(--primary)' : 'linear-gradient(to top, var(--primary), rgba(0,240,255,0.1))', borderTop: '2px solid var(--primary)', opacity: hoveredBar === data ? '1' : '0.6', width: '100%', height: `${data.mb}%`, borderRadius: '4px 4px 0 0', transition: 'all 0.2s ease'}}></div>
                 <div style={{marginTop: '8px', fontSize: '10px', color: hoveredBar === data ? 'white' : 'var(--text-muted)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap'}}>{data.time.split(' ')[0]}</div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderLocation = () => (
     <div className="dashboard-grid" style={{gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', height: '100%', alignItems: 'stretch'}}>
       <div className="card glass-panel" style={{padding: '0', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '500px'}}>
          <div style={{position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(10, 15, 26, 0.9)', padding: '20px', borderRadius: '16px', backdropFilter: 'blur(12px)', border: '1px solid var(--panel-border)'}}>
             <h3 style={{margin: '0 0 16px 0', fontSize: '20px'}}>Ubicación Satelital <span style={{fontSize: '12px', color: 'var(--success)', padding: '2px 8px', border: '1px solid var(--success)', borderRadius: '12px', marginLeft: '8px'}}>GPS ACTIVO</span></h3>
             <p style={{margin: '0 0 0 0', color: 'var(--text-main)', fontSize: '15px'}}><IconMap size={14} style={{marginRight: '6px'}}/> Calle Principal #123</p>
          </div>
          <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src="https://www.openstreetmap.org/export/embed.html?bbox=-99.20%2C19.38%2C-99.10%2C19.45&amp;layer=mapnik&amp;marker=19.42%2C-99.15" style={{filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)', flex: 1}}></iframe>
       </div>

       {/* SECCIÓN GEOCERCAS */}
       <div className="card glass-panel" style={{display: 'flex', flexDirection: 'column'}}>
          <div className="card-header" style={{borderBottom: '1px solid var(--panel-border)', paddingBottom: '16px', marginBottom: '16px'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <IconTarget size={24} color="var(--secondary)" />
                <h3 style={{margin: 0}}>Geocercas (Zonas Seguras)</h3>
             </div>
          </div>
          <p style={{color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px'}}>Recibe una alerta inmediata si el dispositivo sale del área permitida dibujada en el mapa.</p>
          
          <button onClick={addGeofence} style={{width: '100%', padding: '14px', background: 'rgba(138,43,226, 0.1)', border: '1px dashed var(--secondary)', color: 'var(--secondary)', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px', fontWeight: 'bold'}}>
             + Dibujar Nueva Cuadrícula
          </button>
          
          <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px'}}>
             {geofences.map(fence => (
                <div key={fence.id} style={{padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                   <div>
                     <h4 style={{margin: '0 0 6px 0', color: fence.active ? 'white' : 'var(--text-muted)'}}>{fence.name}</h4>
                     <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>Radio protección: {fence.radius}</span>
                   </div>
                   <label className="switch">
                      <input type="checkbox" checked={fence.active} onChange={() => {
                        setGeofences(geofences.map(f => f.id === fence.id ? {...f, active: !f.active} : f));
                      }} />
                      <span className="slider"></span>
                   </label>
                </div>
             ))}
          </div>
       </div>
     </div>
  );

  const renderApps = () => (
    <div className="dashboard-grid" style={{gridTemplateColumns: 'minmax(0, 1fr)'}}>
      <div className="card glass-panel" style={{height: '100%', overflowY: 'auto'}}>
        <div className="card-header" style={{borderBottom: '1px solid var(--panel-border)', paddingBottom: '20px'}}><div style={{display: 'flex', alignItems: 'center', gap: '16px'}}><div style={{background: 'rgba(0, 240, 255, 0.1)', padding: '12px', borderRadius: '12px'}}><IconPhone size={28} color="var(--primary)"/></div><div><h2 style={{margin: '0 0 4px 0'}}>Fuerzar Políticas</h2></div></div></div>
        <div className="apps-list" style={{marginTop: '24px'}}>
          {appsData.map((app) => (
            <div key={app.id} className="app-item" style={{padding: '24px', background: 'rgba(0,0,0,0.2)', border: app.active ? '1px solid rgba(255,255,255,0.02)' : '1px solid rgba(255, 51, 102, 0.3)'}}>
              <div className="app-info" style={{gap: '24px'}}><div style={{width: '56px', height: '56px', background: app.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: app.active ? 'none' : 'grayscale(100%)', opacity: app.active ? 1 : 0.4}}>{getIconForApp(app.id)}</div>
                <div className="app-details"><h4 style={{fontSize: '20px', marginBottom: '6px', color: app.active ? 'white' : 'var(--text-muted)', textDecoration: app.active ? 'none' : 'line-through'}}>{app.name}</h4><div style={{display: 'flex', gap: '8px', alignItems: 'center'}}><span style={{background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: 'var(--text-muted)'}}>{app.type}</span><span style={{color: app.active ? 'var(--primary)' : 'var(--danger)', fontWeight: '500'}}>{app.time}</span></div></div>
              </div>
              <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}><button onClick={() => handleLimitApp(app.name)} style={{background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', padding: '10px 20px', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'}}>⏳ Poner Límite</button><div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'}}>
                  <label className="switch danger-switch"><input type="checkbox" checked={app.active} onChange={() => handleToggleApp(app.id)} /><span className="slider"></span></label>
                  <span style={{fontSize: '11px', color: app.active ? 'var(--success)' : 'var(--danger)'}}>{app.active ? 'Permitido' : 'Bloqueado'}</span>
                </div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWeb = () => (
     <div className="dashboard-grid" style={{gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '32px'}}>
        <div className="card glass-panel" style={{height: 'fit-content'}}>
          <div className="card-header" style={{borderBottom: '1px solid var(--panel-border)', paddingBottom: '20px'}}><div style={{display: 'flex', alignItems: 'center', gap: '16px'}}><div style={{background: 'rgba(255, 51, 102, 0.1)', padding: '12px', borderRadius: '12px'}}><IconShield size={28} color="var(--danger)"/></div><div><h2 style={{margin: '0 0 4px 0'}}>Lista Negra de Dominios</h2></div></div></div>
          <form onSubmit={handleAddUrl} style={{display: 'flex', gap: '12px', marginTop: '24px'}}><input type="text" placeholder="ej. tiktok.com" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={{flex: 1, padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '10px', color: 'white'}} required /><button type="submit" style={{padding: '14px 24px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'}}>Bloquear</button></form>
          <div className="apps-list" style={{marginTop: '32px'}}>{blockedUrls.map((url, i) => (<div key={i} className="app-item" style={{background: 'rgba(255, 51, 102, 0.05)', border: '1px solid rgba(255, 51, 102, 0.2)', padding: '16px 20px'}}><div className="app-info"><IconShield size={20} color="var(--danger)" /><span style={{fontSize: '16px', fontWeight: '500'}}>{url}</span></div><button onClick={() => removeUrl(url)} style={{background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '8px'}}><IconTrash size={20} /> Borrar</button></div>))}</div>
        </div>
        <div className="card glass-panel" style={{height: 'fit-content'}}>
           <div className="card-header" style={{borderBottom: '1px solid var(--panel-border)', paddingBottom: '20px'}}><div style={{display: 'flex', alignItems: 'center', gap: '16px'}}><div style={{background: 'rgba(0, 240, 255, 0.1)', padding: '12px', borderRadius: '12px'}}><IconGlobe size={28} color="var(--primary)"/></div><div><h2 style={{margin: '0 0 4px 0'}}>Filtros de Red</h2></div></div></div>
          <div className="apps-list" style={{marginTop: '24px'}}>
             <div className="app-item" style={{padding: '24px', background: 'rgba(0,0,0,0.2)'}}><div className="app-details"><h4 style={{fontSize: '18px', color: switches.safeSearch ? 'white' : 'var(--text-muted)'}}>Búsqueda Segura (SafeSearch)</h4></div><label className="switch"><input type="checkbox" checked={switches.safeSearch} onChange={() => setSwitches({...switches, safeSearch: !switches.safeSearch})} /><span className="slider"></span></label></div>
             <div className="app-item" style={{padding: '24px', background: 'rgba(0,0,0,0.2)'}}><div className="app-details"><h4 style={{fontSize: '18px', color: switches.adult ? 'var(--danger)' : 'var(--text-muted)'}}>Filtro +18 Extremo</h4></div><label className="switch danger-switch"><input type="checkbox" checked={switches.adult} onChange={() => setSwitches({...switches, adult: !switches.adult})} /><span className="slider"></span></label></div>
          </div>
        </div>
      </div>
  );

  // SECCIÓN CONFIGURACIÓN
  const renderSettings = () => (
     <div className="dashboard-grid" style={{gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', alignItems: 'start'}}>
        <div className="card glass-panel">
            <div className="card-header" style={{borderBottom: '1px solid var(--panel-border)', paddingBottom: '20px', marginBottom: '24px'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                  <div style={{background: 'rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px'}}><IconSet size={28} color="white"/></div>
                  <div><h2 style={{margin: '0 0 4px 0'}}>Ajustes de Cuenta Padre</h2><span style={{color: 'var(--text-muted)'}}>Planes, facturación y preferencias de alertas.</span></div>
               </div>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px'}}>
               <div><label style={{display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '13px'}}>Correo Vinculado</label><input type="text" value="padre@correo.com" disabled style={{width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '8px', color: 'var(--text-muted)'}} /></div>
               <div><label style={{display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '13px'}}>Plan Actual</label><input type="text" value="NiñoSafe Premium Anual" disabled style={{width: '100%', padding: '14px', background: 'rgba(0,240,255,0.1)', border: '1px solid var(--primary)', borderRadius: '8px', color: 'var(--primary)', fontWeight: 'bold'}} /></div>
            </div>

            <h3 style={{borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px', marginBottom: '20px'}}>Método de Pago</h3>
            <div className="app-item" style={{background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', padding: '16px', borderRadius: '12px', marginBottom: '40px'}}>
               <div className="app-info"><IconCreditCard size={24} color="var(--text-muted)" /><span style={{fontSize: '16px'}}>Visa terminada en •••• 4242</span></div>
               <button style={{background: 'transparent', border: '1px solid var(--text-muted)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'}}>Actualizar Tarjeta</button>
            </div>
        </div>

        <div className="card glass-panel" style={{border: '1px solid var(--danger)'}}>
            <h3 style={{color: 'var(--danger)', marginBottom: '16px', marginTop: '0'}}>Zona de Peligro</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5'}}>Al borrar un dispositivo, se desinstalarán automáticamente las políticas de bloqueo del celular de tu hijo y quedará libre de supervisión.</p>
            <button onClick={() => alert('Confirmación requerida: ¿Deseas borrar las limitaciones del niño en el dispositivo "Galaxy S24"?')} style={{width: '100%', padding: '14px', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '12px'}}>
               Borrar Perfil de "Niño"
            </button>
            <button onClick={handleLogoutReal} style={{width: '100%', padding: '14px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
               Cerrar Sesión Oficial (Log Out)
            </button>
        </div>
     </div>
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="brand">
          <IconShield className="brand-icon" size={36} color="var(--primary)" />
          <span style={{fontSize: '28px', textShadow: '0 0 10px rgba(0,240,255,0.4)'}}>NiñoSafe</span>
        </div>

        <nav className="nav-links">
          <a className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><IconDash size={22} /> Panel Principal</a>
          <a className={`nav-item ${activeTab === 'location' ? 'active' : ''}`} onClick={() => setActiveTab('location')}><IconMap size={22} /> Rastreo Satelital</a>
          <a className={`nav-item ${activeTab === 'apps' ? 'active' : ''}`} onClick={() => setActiveTab('apps')}><IconPhone size={22} /> Aplicaciones</a>
          <a className={`nav-item ${activeTab === 'web' ? 'active' : ''}`} onClick={() => setActiveTab('web')}><IconGlobe size={22} /> Filtro Web TLS</a>
          <div style={{width: '100%', height: '1px', background: 'var(--panel-border)', margin: '16px 0'}}></div>
          <a className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><IconSet size={22} /> Ajustes y Cuenta</a>
        </nav>

        <button 
          className="lock-button" 
          onClick={handleToggleDeviceLock}
          style={{ background: deviceLocked ? 'linear-gradient(135deg, #00FF9D, #00B873)' : 'linear-gradient(135deg, rgba(255, 51, 102, 0.8), rgba(200, 20, 70, 0.8))', padding: '20px', cursor: 'pointer' }}>
          {deviceLocked ? <IconUnlock size={24} /> : <IconLock size={24} />} {deviceLocked ? 'Restaurar Pantalla' : 'Bloquear Teléfono'}
        </button>
      </aside>

      {/* Main Content Dashboard */}
      <main className="main-content" style={{padding: '0 16px 0 32px', position: 'relative'}}>
        
        {/* DROPDOWN NOTIFICACIONES */}
        {showNotifications && (
           <div className="card glass-panel" style={{position: 'absolute', top: '90px', right: '180px', width: '380px', zIndex: 100, padding: '0', overflow: 'hidden', border: '1px solid var(--primary)', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'}}>
              <div style={{padding: '20px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <h3 style={{margin: 0}}>Centro de Alertas</h3>
                 <span style={{fontSize: '12px', color: 'var(--primary)', cursor: 'pointer'}} onClick={() => setShowNotifications(false)}>Cerrar ✕</span>
              </div>
              <div style={{maxHeight: '350px', overflowY: 'auto'}}>
                 <div style={{padding: '16px 20px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255, 51, 102, 0.1)', display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                    <div style={{background: 'var(--danger)', padding: '8px', borderRadius: '50%'}}><IconShield size={16} color="white" /></div>
                    <div><h4 style={{margin: '0 0 4px 0', color: 'var(--danger)'}}>Intento Web de Adultos Bloqueado</h4><p style={{margin: 0, fontSize: '13px', color: 'var(--text-muted)'}}>Se interceptó un intento a "xvideos.com". El sitio no se cargó.</p><span style={{fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px'}}>Hace 5 min</span></div>
                 </div>
                 <div style={{padding: '16px 20px', borderBottom: '1px solid var(--panel-border)', display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                    <div style={{background: 'rgba(138,43,226, 0.3)', padding: '8px', borderRadius: '50$'}}><IconTarget size={16} color="var(--secondary)" /></div>
                    <div><h4 style={{margin: '0 0 4px 0'}}>Alerta de Geocerca (Salida)</h4><p style={{margin: 0, fontSize: '13px', color: 'var(--text-muted)'}}>El dispositivo ha abandonado el radio de la "Escuela Primaria".</p><span style={{fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px'}}>Hace 45 min</span></div>
                 </div>
                 <div style={{padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                    <div style={{background: 'rgba(0,255,157, 0.3)', padding: '8px', borderRadius: '50%'}}><IconGame size={16} color="var(--success)" /></div>
                    <div><h4 style={{margin: '0 0 4px 0'}}>Límite de Tiempo Alcanzado</h4><p style={{margin: 0, fontSize: '13px', color: 'var(--text-muted)'}}>Roblox ha excedido su límite diario y se ha bloqueado exitosamente.</p><span style={{fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px'}}>Ayer - 8:30 PM</span></div>
                 </div>
              </div>
           </div>
        )}

        <header className="header" style={{marginBottom: '40px'}}>
          <div>
            <h1 style={{fontSize: '36px', marginBottom: '8px'}}>Protección Activa</h1>
            <p style={{color: 'var(--text-muted)', fontSize: '16px'}}>Control total visual completado.</p>
          </div>
           <div className="header-actions">
            <div style={{position: 'relative', cursor: 'pointer', padding: '12px', background: showNotifications ? 'var(--primary)' : 'rgba(255,255,255,0.05)', borderRadius: '50%', color: showNotifications ? '#000' : 'white', transition: '0.2s'}} onClick={() => setShowNotifications(!showNotifications)}>
              <IconBell size={24} color={showNotifications ? '#000' : 'var(--primary)'} />
              {!showNotifications && <div style={{position: 'absolute', top: '10px', right: '12px', width: '10px', height: '10px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-color)'}}></div>}
            </div>
            <div className="profile-btn" style={{padding: '8px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary)', cursor: 'pointer'}} onClick={() => setActiveTab('settings')}>
              <span style={{fontWeight: '500'}}>Cuenta Padre</span>
              <div className="profile-img" style={{background: 'var(--primary)', color: '#000'}}>P</div>
            </div>
           </div>
        </header>

        <div style={{paddingBottom: '40px', height: 'calc(100% - 100px)'}}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'location' && renderLocation()}
          {activeTab === 'apps' && renderApps()}
          {activeTab === 'web' && renderWeb()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  );
}

export default App;
