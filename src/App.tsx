import React from 'react';
// import logo from './logo.svg';
import './App.css';
import GoogleSignInSetup from './common/googleSignIn/GoogleSignInSetup';
import Home from './pages/Home/Home';
import { BrowserRouter } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core';
import theme from './theme';
import { testSignatures } from 'kachery-js/crypto/signatures';

testSignatures()

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <GoogleSignInSetup>
          <div className="App">
            <Home />
          </div>
        </GoogleSignInSetup>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

export default App;
