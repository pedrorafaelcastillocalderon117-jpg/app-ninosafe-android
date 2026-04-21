package com.ninosafe.app;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;
import java.util.Arrays;
import java.util.List;

/**
 * Servicio de Accesibilidad que vigila cada ventana o app nueva que se abre.
 * Si detecta que la aplicación abierta está en la lista de bloqueadas,
 * empuja la aplicación hacia atrás y devuelve al niño al escritorio.
 */
public class AppBlockerAccessibilityService extends AccessibilityService {

    private static final String TAG = "NinoSafeBlocker";
    
    // Lista temporal de paquetes bloqueados (Más adelante, obtendremos estos datos del LocalStorage o Firebase directamente desde tu Dashboard en React)
    private final List<String> blockedApps = Arrays.asList(
        "com.roblox.client",       // Roblox
        "com.zhiliaoapp.musically", // TikTok
        "com.google.android.youtube", // YouTube
        "com.android.chrome"       // Chrome (Para Filtro Fuerte)
    );

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // Interceptamos ÚNICAMENTE cuando la ventana del dispositivo cambia (una nueva app es enfocada)
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            if (event.getPackageName() != null) {
                String packageName = event.getPackageName().toString();
                Log.d(TAG, "El dispositivo intentó abrir la app con paquete: " + packageName);
                
                // Evaluamos si el nombre del paquete recién abierto está en la lista negra
                if (blockedApps.contains(packageName)) {
                    Log.d(TAG, "¡INTENTO DENEGADO! Interceptando: " + packageName);
                    
                    // Mostramos una pantalla o mensaje al niño indicando la restricción
                    Toast.makeText(this, "🚨 Esta aplicación ha sido bloqueada por el panel de NiñoSafe 🚨", Toast.LENGTH_SHORT).show();
                    
                    // Esto es lo que realmente detiene al niño: Expulsarlo automáticamente a la pantalla de inicio ("Home")
                    goToHomeScreen();
                }
            }
        }
    }

    /**
     * Lanza una orden crítica al sistema de Android forzando el retorno al escritorio, 
     * lo cual oculta o corta el acceso a la app recién abierta de inmediato. 
     */
    private void goToHomeScreen() {
        Intent startMain = new Intent(Intent.ACTION_MAIN);
        startMain.addCategory(Intent.CATEGORY_HOME);
        startMain.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(startMain);
    }

    @Override
    public void onInterrupt() {
        // En caso de que el sistema interrumpa el servicio
    }
}
