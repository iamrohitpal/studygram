import { createTheme } from '@mui/material/styles';

export const getAdminTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#0f172a', // Slate 900
        light: '#334155',
        dark: '#020617',
      },
      secondary: {
        main: '#f59e0b', // Amber 500
        light: '#fbbf24',
        dark: '#d97706',
      },
      background: {
        default: mode === 'light' ? '#f1f5f9' : '#0b0f19',
        paper: mode === 'light' ? '#ffffff' : '#111827',
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f8fafc',
        secondary: mode === 'light' ? '#475569' : '#94a3b8',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        'system-ui',
        '-apple-system',
        'sans-serif',
      ].join(','),
      h1: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
      },
      h4: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
      },
      h5: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
      },
      h6: {
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '16px',
            border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #1f2937',
            boxShadow: 'none',
          },
        },
      },
    },
  });
};
