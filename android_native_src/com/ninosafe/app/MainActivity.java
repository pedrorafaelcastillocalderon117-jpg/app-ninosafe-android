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
        registerPlugin(AppScannerPlugin.class);
    }
}
