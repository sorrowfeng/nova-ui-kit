pub(super) fn json_string(value: &str) -> String {
    serde_json::to_string(value).unwrap_or_else(|_| "\"\"".to_string())
}

pub(super) fn json_string_array(values: &[String]) -> String {
    serde_json::to_string(values).unwrap_or_else(|_| "[]".to_string())
}

pub(super) fn html_text(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

pub(super) fn to_error(error: impl std::fmt::Display) -> String {
    error.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn json_string_escapes_quotes() {
        assert_eq!(json_string("a\"b"), "\"a\\\"b\"");
    }

    #[test]
    fn html_text_escapes_markup() {
        assert_eq!(html_text("<b>&\"x\"</b>"), "&lt;b&gt;&amp;&quot;x&quot;&lt;/b&gt;");
    }

    #[test]
    fn json_string_array_round_trips() {
        let values = vec!["a".to_string(), "b".to_string()];
        assert_eq!(json_string_array(&values), "[\"a\",\"b\"]");
    }
}
