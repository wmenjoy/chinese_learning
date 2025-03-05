export const theme = {
  colors: {
    primary: '#FF9800',
    primaryLight: '#FFB74D',
    primaryDark: '#F57C00',
    secondary: '#4CAF50',
    secondaryLight: '#81C784',
    background: '#FFF9E6',
    surface: '#FFFFFF',
    text: {
      primary: '#37474F',
      secondary: '#607D8B',
      light: '#90A4AE'
    },
    accent: {
      pink: '#FF4081',
      purple: '#7C4DFF',
      blue: '#2196F3',
      green: '#4CAF50',
      yellow: '#FFC107'
    }
  },
  shadows: {
    small: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 8px rgba(0,0,0,0.1)',
    large: '0 8px 16px rgba(0,0,0,0.1)',
    hover: '0 8px 24px rgba(0,0,0,0.15)'
  },
  borderRadius: {
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    circle: '50%'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  animations: {
    bounce: 'bounce 0.5s ease',
    fadeIn: 'fadeIn 0.3s ease',
    float: 'float 3s ease-in-out infinite'
  },
  typography: {
    fontFamily: {
      main: "'Nunito', 'PingFang SC', 'Microsoft YaHei', sans-serif",
      decorative: "'Comic Sans MS', cursive"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
      title: '2.5rem'
    }
  }
};

export const keyframes = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
`;

export const GlobalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

  body {
    font-family: ${theme.typography.fontFamily.main};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text.primary};
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }

  * {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 700;
  }

  button {
    font-family: ${theme.typography.fontFamily.main};
  }
`; 