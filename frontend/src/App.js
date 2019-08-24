import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import axios from "axios";

import "./App.css";

function App() {
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    axios({
      method: "get",
      url: "http://localhost:8000/exercises"
    }).then(response => {
      setSamples(response.data);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div>{JSON.stringify(samples)}</div>
      </header>
    </div>
  );
}

export default App;
