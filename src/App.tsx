import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, CssBaseline, Box, Paper } from '@mui/material';
import { BusinessCard } from './components/BusinessCard';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <BusinessCard 
              processedImage={processedImage}
              setProcessedImage={setProcessedImage}
            />
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
