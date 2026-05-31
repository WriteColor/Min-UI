#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
fn start_agent() -> Result<String, String> {
    use std::process::Command;
    use std::os::windows::process::CommandExt;

    // Find directory containing main.py
    let mut current = std::env::current_dir().unwrap_or_default();
    let mut main_py_dir = None;
    for _ in 0..5 {
        if current.join("main.py").exists() {
            main_py_dir = Some(current.clone());
            break;
        }
        if let Some(parent) = current.parent() {
            current = parent.to_path_buf();
        } else {
            break;
        }
    }

    let dir = match main_py_dir {
        Some(d) => d,
        None => return Err("Could not find main.py in parent directories".into()),
    };

    let venv_w = dir.join(".venv/Scripts/pythonw.exe");
    let venv_py = dir.join(".venv/Scripts/python.exe");

    let exe = if venv_w.exists() {
        venv_w
    } else if venv_py.exists() {
        venv_py
    } else {
        std::path::PathBuf::from("python")
    };

    let res = Command::new(exe)
        .arg("main.py")
        .current_dir(&dir)
        .creation_flags(0x00000008) // DETACHED_PROCESS
        .spawn();

    match res {
        Ok(_) => Ok("MIN started successfully".into()),
        Err(e) => Err(format!("Failed to spawn process: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_agent])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            
            // Apply window shadow/translucency configurations if available
            #[cfg(target_os = "windows")]
            {
                let _ = window.set_decorations(false);
                let _ = window.set_shadow(true);
            }
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

