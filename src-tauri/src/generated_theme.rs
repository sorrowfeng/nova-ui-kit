//! Project locale / theme are baked into the generated app (P0-3).
//!
//! The builder's page config carries `locale` ("zh-CN" | "en-US") and `theme`
//! ("light" | "dark"). Those choices must reach the generated CSS and copy:
//! the emitted stylesheet gets theme variables, and index.html gets the
//! document `lang` plus a `__NOVA_LOCALE__` bootstrap the runtime reads.

use serde_json::Value;

/// Locales the generated runtime has message bundles for.
pub(super) const SUPPORTED_LOCALES: [&str; 2] = ["zh-CN", "en-US"];

/// Themes the generated stylesheet can render.
pub(super) const SUPPORTED_THEMES: [&str; 2] = ["light", "dark"];

pub(super) const DEFAULT_LOCALE: &str = "zh-CN";
pub(super) const DEFAULT_THEME: &str = "light";

/// Normalize a raw locale string to a supported locale tag.
pub(super) fn normalize_locale(value: &str) -> String {
    let trimmed = value.trim();
    // Common aliases first — "en" and "zh" are what callers actually write.
    if trimmed.eq_ignore_ascii_case("en") {
        return "en-US".to_string();
    }
    if trimmed.eq_ignore_ascii_case("zh") {
        return "zh-CN".to_string();
    }
    // Then the allowlist, so a new supported locale only has to be added there.
    SUPPORTED_LOCALES
        .iter()
        .find(|supported| trimmed.eq_ignore_ascii_case(supported))
        .map(|supported| supported.to_string())
        .unwrap_or_else(|| DEFAULT_LOCALE.to_string())
}

/// Normalize a raw theme string to a supported theme name.
pub(super) fn normalize_theme(value: &str) -> String {
    let trimmed = value.trim().to_ascii_lowercase();
    SUPPORTED_THEMES
        .iter()
        .find(|supported| trimmed == **supported)
        .map(|supported| supported.to_string())
        .unwrap_or_else(|| DEFAULT_THEME.to_string())
}

/// Read the project locale, falling back to `fallback` then `zh-CN`.
pub(super) fn locale_from_project(project: &Value, fallback: &str) -> String {
    let page_value = project
        .get("files")
        .and_then(Value::as_array)
        .and_then(|files| {
            let active_file_id = project
                .get("activeFileId")
                .and_then(Value::as_str)
                .unwrap_or_default();
            files
                .iter()
                .find(|file| {
                    !active_file_id.is_empty()
                        && file
                            .get("id")
                            .and_then(Value::as_str)
                            .is_some_and(|id| id == active_file_id)
                })
                .or_else(|| files.first())
                .and_then(|file| file.get("page"))
        })
        .and_then(|page| page.get("locale"))
        .and_then(Value::as_str)
        .map(str::to_string);
    let configured = project
        .get("releaseConfig")
        .and_then(|config| config.get("locale"))
        .and_then(Value::as_str)
        .map(str::to_string);
    let raw = page_value
        .or(configured)
        .filter(|value| !value.trim().is_empty());
    match raw {
        Some(value) => normalize_locale(&value),
        None => normalize_locale(fallback),
    }
}

/// Read the project theme, falling back to `fallback` then `light`.
pub(super) fn theme_from_project(project: &Value, fallback: &str) -> String {
    let page_value = project
        .get("files")
        .and_then(Value::as_array)
        .and_then(|files| {
            let active_file_id = project
                .get("activeFileId")
                .and_then(Value::as_str)
                .unwrap_or_default();
            files
                .iter()
                .find(|file| {
                    !active_file_id.is_empty()
                        && file
                            .get("id")
                            .and_then(Value::as_str)
                            .is_some_and(|id| id == active_file_id)
                })
                .or_else(|| files.first())
                .and_then(|file| file.get("page"))
        })
        .and_then(|page| page.get("theme"))
        .and_then(Value::as_str)
        .map(str::to_string);
    let configured = project
        .get("releaseConfig")
        .and_then(|config| config.get("theme"))
        .and_then(Value::as_str)
        .map(str::to_string);
    let raw = page_value
        .or(configured)
        .filter(|value| !value.trim().is_empty());
    match raw {
        Some(value) => normalize_theme(&value),
        None => normalize_theme(fallback),
    }
}

/// Theme variables for one theme. Emitted at the top of the generated
/// stylesheet so they are defined before use and survive the preview cap.
pub(super) fn theme_variables(theme: &str) -> String {
    let dark = normalize_theme(theme) == "dark";
    let vars = if dark {
        [
            ("--nova-theme-bg", "#14121c"),
            ("--nova-theme-surface", "#1c1926"),
            ("--nova-theme-surface-alt", "#262233"),
            ("--nova-theme-text", "#f2eefa"),
            ("--nova-theme-text-muted", "#b7aec6"),
            ("--nova-theme-accent", "#cbb8ff"),
            ("--nova-theme-accent-contrast", "#2c1a5e"),
            ("--nova-theme-border", "#3a3350"),
            ("--nova-theme-danger", "#ffb4ab"),
            ("--nova-theme-success", "#8fe0b0"),
        ]
    } else {
        [
            ("--nova-theme-bg", "#f8f7fb"),
            ("--nova-theme-surface", "#ffffff"),
            ("--nova-theme-surface-alt", "#f1eef8"),
            ("--nova-theme-text", "#1d1b20"),
            ("--nova-theme-text-muted", "#5f5a66"),
            ("--nova-theme-accent", "#5b34e0"),
            ("--nova-theme-accent-contrast", "#ffffff"),
            ("--nova-theme-border", "#d8d2e4"),
            ("--nova-theme-danger", "#b3261e"),
            ("--nova-theme-success", "#146c43"),
        ]
    };

    let mut css = String::from("/* Nova project theme: ");
    css.push_str(if dark { "dark" } else { "light" });
    css.push_str(" (generated from page config) */\n:root {\n");
    for (name, value) in vars {
        css.push_str("  ");
        css.push_str(name);
        css.push_str(": ");
        css.push_str(value);
        css.push_str(";\n");
    }
    css.push_str("}\n");
    css
}

/// Surface overrides applied after the base stylesheet so the theme wins
/// the cascade (the base template ships hardcoded light surfaces).
pub(super) fn theme_surface_overrides() -> String {
    "\n/* Nova project theme surfaces */\n\
.app {\n  background: var(--nova-theme-bg);\n  color: var(--nova-theme-text);\n}\n\
.app-dialog,\n.app-tool {\n  background: var(--nova-theme-bg);\n  color: var(--nova-theme-text);\n}\n"
        .to_string()
}

/// `lang` attribute value for the generated index.html.
pub(super) fn html_lang(locale: &str) -> String {
    match normalize_locale(locale).as_str() {
        "en-US" => "en".to_string(),
        _ => "zh-CN".to_string(),
    }
}

/// Inline bootstrap so the generated runtime knows the project locale
/// before the first render (the runtime template reads `__NOVA_LOCALE__`).
pub(super) fn locale_bootstrap_script(locale: &str) -> String {
    let normalized = normalize_locale(locale);
    format!(
        "<script>window.__NOVA_LOCALE__ = \"{}\";</script>",
        normalized.replace('\\', "\\\\").replace('"', "\\\"")
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn normalize_locale_accepts_aliases_and_defaults() {
        assert_eq!(normalize_locale("en"), "en-US");
        assert_eq!(normalize_locale("EN-us"), "en-US");
        assert_eq!(normalize_locale("zh-CN"), "zh-CN");
        assert_eq!(normalize_locale("fr-FR"), "zh-CN");
        assert_eq!(normalize_locale(""), "zh-CN");
    }

    #[test]
    fn normalize_theme_only_allows_dark_as_alternate() {
        assert_eq!(normalize_theme("dark"), "dark");
        assert_eq!(normalize_theme("DARK"), "dark");
        assert_eq!(normalize_theme("light"), "light");
        assert_eq!(normalize_theme("solarized"), "light");
    }

    #[test]
    fn project_locale_theme_read_from_active_page() {
        let project = json!({
            "activeFileId": "b",
            "files": [
                { "id": "a", "page": { "locale": "en-US", "theme": "dark" } },
                { "id": "b", "page": { "locale": "en-US", "theme": "dark" } }
            ]
        });
        assert_eq!(locale_from_project(&project, DEFAULT_LOCALE), "en-US");
        assert_eq!(theme_from_project(&project, DEFAULT_THEME), "dark");
    }

    #[test]
    fn project_locale_theme_fall_back_to_release_config_then_default() {
        let project = json!({
            "releaseConfig": { "locale": "en", "theme": "dark" },
            "files": [ { "id": "a", "page": {} } ]
        });
        assert_eq!(locale_from_project(&project, DEFAULT_LOCALE), "en-US");
        assert_eq!(theme_from_project(&project, DEFAULT_THEME), "dark");

        let empty = json!({ "files": [] });
        assert_eq!(locale_from_project(&empty, DEFAULT_LOCALE), "zh-CN");
        assert_eq!(theme_from_project(&empty, DEFAULT_THEME), "light");
    }

    #[test]
    fn theme_variables_switch_palette() {
        let light = theme_variables("light");
        let dark = theme_variables("dark");
        assert!(light.contains("--nova-theme-bg: #f8f7fb;"));
        assert!(dark.contains("--nova-theme-bg: #14121c;"));
        assert!(light.contains("Nova project theme: light"));
        assert!(dark.contains("Nova project theme: dark"));
    }

    #[test]
    fn locale_bootstrap_and_lang_track_locale() {
        assert_eq!(html_lang("en-US"), "en");
        assert_eq!(html_lang("zh-CN"), "zh-CN");
        assert_eq!(
            locale_bootstrap_script("en-US"),
            "<script>window.__NOVA_LOCALE__ = \"en-US\";</script>"
        );
    }
}
