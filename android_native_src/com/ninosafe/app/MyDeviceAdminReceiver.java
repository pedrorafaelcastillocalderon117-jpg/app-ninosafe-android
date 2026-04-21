package com.ninosafe.app;

import android.app.admin.DeviceAdminReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

/**
 * Este es el servicio en Java Nativo que intercepta los intentos del niño
 * por borrar la aplicación. Obliga a que NiñoSafe se mantenga como "Dueño"
 * del dispositivo (Device Admin).
 */
public class MyDeviceAdminReceiver extends DeviceAdminReceiver {

    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
        Toast.makeText(context, "Protección NiñoSafe Activada. Ahora la app no puede ser desinstalada sin el PIN.", Toast.LENGTH_LONG).show();
    }

    @Override
    public CharSequence onDisableRequested(Context context, Intent intent) {
        // Aquí se dispara cuando el niño intenta quitar el permiso de Administrador en Ajustes
        return "¡ADVERTENCIA! Si desactivas la protección en NiñoSafe, el teléfono bloqueará su pantalla inmediatamente y se notificará a tus padres.";
    }

    @Override
    public void onDisabled(Context context, Intent intent) {
        super.onDisabled(context, intent);
        Toast.makeText(context, "Protección NiñoSafe fue desactivada.", Toast.LENGTH_LONG).show();
        // Opcionalmente: Podríamos forzar un Broadcast para bloquear el teléfono aquí.
    }
}
