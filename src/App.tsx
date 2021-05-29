import React from 'react';
// import logo from './logo.svg';
import './App.css';
import GoogleSignInSetup from './common/googleSignIn/GoogleSignInSetup';
import Home from './pages/Home/Home';

function App() {
  return (
    <GoogleSignInSetup>
      <div className="App">
        <Home />
      </div>
    </GoogleSignInSetup>
  );
}

export default App;
