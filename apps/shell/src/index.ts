// Async boundary required by Module Federation: shared dependencies must be
// negotiated before the app code that consumes them is evaluated.
import('./bootstrap');

export {};
