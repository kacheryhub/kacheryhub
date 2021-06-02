import React from 'react';
// import logo from './logo.svg';
import './App.css';
import GoogleSignInSetup from './common/googleSignIn/GoogleSignInSetup';
import Home from './pages/Home/Home';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <GoogleSignInSetup>
        <div className="App">
          <Home />
        </div>
      </GoogleSignInSetup>
    </BrowserRouter>
  );
}

export default App;
