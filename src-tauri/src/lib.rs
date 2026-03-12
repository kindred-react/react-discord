use serde::Serialize;
use std::panic;

#[derive(Serialize)]
pub struct AppInfo {
    name: String,
    version: String,
}

#[tauri::command]
fn get_app_info() -> AppInfo {
    AppInfo {
        name: "Discord Clone".to_string(),
        version: "1.0.0".to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    panic::set_hook(Box::new(|info| {
        eprintln!("PANIC: {}", info);
        if let Some(location) = info.location() {
            eprintln!("Panic occurred at {}:{}:{}", location.file(), location.line(), location.column());
        }
    }));

    let result = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_app_info])
        .run(tauri::generate_context!());
    
    if let Err(e) = result {
        eprintln!("Error running Tauri: {}", e);
        std::process::exit(1);
    }
}
