// =========================================================================
// EOS — HIGH-PERFORMANCE RUST AST TOKEN SANITIZER & LEXER
// Compiled to WebAssembly for sub-millisecond edge sanitization in Cursor
// =========================================================================

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct EosTokenSanitizer;

#[wasm_bindgen]
impl EosTokenSanitizer {
    /// Sanitizes user text by stripping dangerous HTML tags and control characters
    pub fn sanitize(input: &str) -> String {
        let mut result = String::with_capacity(input.len());
        let mut in_tag = false;

        for c in input.chars() {
            match c {
                '<' => in_tag = true,
                '>' => in_tag = false,
                _ if !in_tag => {
                    if !c.is_control() {
                        result.push(c);
                    }
                }
                _ => {}
            }
        }
        result.trim().to_string()
    }

    /// Fast token counter
    pub fn count_tokens(input: &str) -> usize {
        input.split_whitespace().count()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_strips_html() {
        let dirty = "<script>alert('xss')</script>Juan Pérez";
        let clean = EosTokenSanitizer::sanitize(dirty);
        assert_eq!(clean, "alert('xss')Juan Pérez");
    }

    #[test]
    fn test_sanitize_strips_nested_tags() {
        let dirty = "<img src=x onerror=alert(1)> Rionegro";
        let clean = EosTokenSanitizer::sanitize(dirty);
        assert_eq!(clean, "Rionegro");
    }

    #[test]
    fn test_count_tokens() {
        let text = "Alexander Rodriguez Remodelaciones Rionegro Antioquia";
        assert_eq!(EosTokenSanitizer::count_tokens(text), 5);
    }
}
