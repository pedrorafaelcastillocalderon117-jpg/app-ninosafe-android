package com.ninosafe.app;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.List;
import java.util.ArrayList;

@CapacitorPlugin(name = "AppScanner")
public class AppScannerPlugin extends Plugin {

    @PluginMethod
    public void getInstalledApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);
        
        List<JSObject> appList = new ArrayList<>();
        
        for (ApplicationInfo appInfo : packages) {
            // Filtrar apps del sistema si es necesario, pero usualmente queremos todas para bloquear
            if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0 || (appInfo.flags & ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0) {
                JSObject app = new JSObject();
                app.put("name", pm.getApplicationLabel(appInfo).toString());
                app.put("packageName", appInfo.packageName);
                // No podemos enviar el icono como bitmap facilmente sin Base64, lo omitimos por ahora o enviamos luego
                appList.add(app);
            }
        }
        
        JSObject ret = new JSObject();
        ret.put("apps", appList);
        call.resolve(ret);
    }
}
