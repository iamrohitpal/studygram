import { createTheme } from '@mui/material/styles';

export const getMuiTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#4f46e5', // Indigo 600
        light: '#818cf8',
        dark: '#3730a3',
      },
      secondary: {
        main: '#d946ef', // Fuchsia 500 (Instagram vibes)
        light: '#f472b6',
        dark: '#a21caf',
      },
      background: {
        default: mode === 'light' ? '#f8fafc' : '#090d16',
        paper: mode === 'light' ? '#ffffff' : '#111827',
      },
      text: {
        primary: mode === 'light' ? '#0f172a' : '#f1f5f9',
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
            padding: '8px 16px',
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
