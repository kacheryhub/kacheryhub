import React from 'react';
// import logo from './logo.svg';
import './App.css';
import GoogleSignInSetup from './commonComponents/googleSignIn/GoogleSignInSetup';
import Home from './pages/Home/Home';
import { BrowserRouter } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core';
import theme from './theme';
import { testSignatures } from './commonInterface/crypto/signatures';

testSignatures()

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <GoogleSignInSetup>
          {/* <ReCaptchaSetup> */}
            <div className="App">
              <Home />
            </div>
          {/* </ReCaptchaSetup> */}
        </GoogleSignInSetup>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

export default App;
