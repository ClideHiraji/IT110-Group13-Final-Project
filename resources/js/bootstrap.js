import axios from 'axios';

// Make Axios available globally as window.axios
// This mirrors the default Laravel + Vite bootstrap setup so that
// Axios can be used anywhere in your frontend without importing it again.
window.axios = axios;

// Set a default header on all Axios requests:
// - X-Requested-With: 'XMLHttpRequest' is a legacy convention used by
//   many backends (including Laravel) to detect AJAX/XHR requests.
// - Laravel's Request::ajax() / $request->ajax() helpers rely on this value.
// - Note: This header will cause CORS preflight for cross-origin requests.
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
