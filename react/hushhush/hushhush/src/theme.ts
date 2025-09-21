'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#28afb0',
        },
        secondary: {
            main: '#f4d35e',
        },
        background: {
            default: '#0c090d',
        },
        error: {
            main: '#EF476F',
        },
        warning: {
            main: '#FFD166',
        },
        success: {
            main: '#06D6A0',
        },
        text: {
            primary: '#F7FFF7',
        },
        info: {
            main: '#118AB2',
        },
    },
});

export default theme;
