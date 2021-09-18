import { MuiThemeProvider } from '@material-ui/core';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import GoogleSignInSetup from './commonComponents/googleSignIn/GoogleSignInSetup';
import { testSignatures } from './commonInterface/crypto/signatures';
import Home from './pages/Home/Home';
import theme from './theme';

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
