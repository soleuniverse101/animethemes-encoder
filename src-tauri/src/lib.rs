use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let main = app.get_webview_window("main").expect("no main window");
            if !main.is_visible().unwrap() {
                for webview in app.webview_windows().values() {
                    webview.show().unwrap();
                }
            }
            main.set_focus().unwrap();
        }))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_libmpv::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet]);

    #[cfg(debug_assertions)]
    let builder = builder.setup(|app| {
        // Open DevTools console for every webview in development
        use serde::Deserialize;
        use tauri::Listener;

        let app_handle = app.handle().clone();
        app.listen("tauri://webview-created", move |event| {
            #[derive(Clone, Deserialize)]
            struct WebviewCreatedPayload {
                label: String,
            }
            if let Ok(WebviewCreatedPayload { label }) = serde_json::from_str(event.payload()) {
                app_handle
                    .get_webview_window(&label)
                    .unwrap()
                    .open_devtools();
            }
        });

        app.get_webview_window("main").unwrap().open_devtools();

        Ok(())
    });

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
