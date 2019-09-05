import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Exercises from "./components/Exercises";
import Exercise from "./components/DetailedExercise";
import Users from "./components/Users";
import User from "./components/User";
import Home from "./components/Home";

import "./App.css";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/exercises/">Exercises</Link>
            </li>
            <li>
              <Link to="/users/">Users</Link>
            </li>
          </ul>
        </nav>

        <Route path="/" exact component={Home} />
        <Route path="/exercises/" exact component={Exercises} />
        <Route path="/users/" exact component={Users} />
        <Route path="/user/:id" exact component={User} />
        <Route path="/exercise/:id" exact component={Exercise} />
      </div>
    </Router>
  );
}

export default App;
