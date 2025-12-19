import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

/**
 * Application Entry Point
 *
 * This file bootstraps the Inertia.js + React application.
 *
 * Key responsibilities:
 * - Initializes the Inertia.js app with React as the frontend framework.
 * - Configures dynamic page component resolution for code splitting.
 * - Sets up the React root and renders the Inertia app.
 * - Configures the progress bar displayed during page transitions.
 *
 * Flow:
 * 1. Imports global styles (app.css) and bootstrap configuration.
 * 2. Reads VITE_APP_NAME from environment variables for page titles.
 * 3. Calls createInertiaApp() with configuration:
 *    - title: formats page titles as "{PageTitle} - {AppName}".
 *    - resolve: dynamically loads page components from ./Pages/*.jsx.
 *    - setup: creates React root and renders the Inertia App component.
 *    - progress: configures the loading bar color for page transitions.
 *
 * Page Resolution:
 * - Uses Vite's import.meta.glob for automatic code splitting.
 * - Components in ./Pages/ are loaded on-demand when navigated to.
 * - Example: navigating to '/dashboard' loads './Pages/Dashboard.jsx'.
 *
 * Environment Variables:
 * - VITE_APP_NAME: Application name used in browser tab titles.
 *   Defaults to 'Laravel' if not set.
 */

// Application name from .env file (used in page titles)
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialize the Inertia.js application
createInertiaApp({
  /**
   * title callback
   * Formats the browser tab title for each page.
   * 
   * @param {string} title - Page-specific title (e.g., "Dashboard", "Collection")
   * @returns {string} - Formatted title "{title} - {appName}"
   */
  title: (title) => `${title} - ${appName}`,

  /**
   * resolve callback
   * Dynamically resolves and loads page components.
   * 
   * Uses Vite's glob imports for automatic code splitting:
   * - Each page component becomes a separate chunk.
   * - Only loaded when the user navigates to that page.
   * - Improves initial load time and reduces bundle size.
   * 
   * @param {string} name - Page component name (e.g., "Dashboard", "Auth/Login")
   * @returns {Promise<Component>} - Resolved React component
   */
  resolve: (name) =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx'),
    ),

  /**
   * setup callback
   * Initializes the React app and mounts it to the DOM.
   * 
   * @param {object} params
   * @param {HTMLElement} params.el - Root DOM element to mount the app (from server HTML)
   * @param {Component} params.App - Inertia App wrapper component
   * @param {object} params.props - Initial page props from the server
   */
  setup({ el, App, props }) {
    // Create React 18+ root for concurrent rendering
    const root = createRoot(el);

    // Render the Inertia App component with server-provided props
    root.render(<App {...props} />);
  },

  /**
   * progress configuration
   * Configures the NProgress bar shown during Inertia page transitions.
   * 
   * Options:
   * - color: CSS color value for the progress bar.
   * - delay: milliseconds before showing (default: 250).
   * - includeCSS: whether to inject default styles (default: true).
   * - showSpinner: whether to show the spinner (default: false).
   */
  progress: {
    color: '#4B5563', // Gray-600 color for the loading bar
  },
});
