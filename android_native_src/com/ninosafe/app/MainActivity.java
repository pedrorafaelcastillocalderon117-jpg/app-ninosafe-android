package com.ninosafe.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/**
 * MainActivity es el punto de inicio de la aplicación en Android.
 * Hereda de "BridgeActivity", lo cual le dice a Android que no cargue código Java visual,
 * sino que inicie nuestro navegador WebView interno, inyectando todo tu diseño hecho en React/Vite.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Aquí es donde en el futuro pediremos directamente los permisos nativos 
        // antes de mostrar la pantalla (Ej: Permiso de GPS o Accesibilidad).
        
        // Logica para iniciar el Servicio en Segundo Plano (Por ejemplo, el rastreador de GPS constante)
        // se puede integrar desde aquí cuando se construya el plugin completo de GPS.
    }
}
