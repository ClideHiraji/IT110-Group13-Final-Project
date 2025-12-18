import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                'cinematic-offwhite': '#F8F7F3',
                'accent-icy': '#8CE7FF',
                'accent-amber': '#FFB26B'
            },
            fontFamily: {
                display: ['Cinzel', 'serif'],
                ui: ['Inter', 'sans-serif']
            }
        }
    },

    plugins: [forms],
};
