import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import styled from "styled-components";

import Exercises from "./components/Exercises";
import Exercise from "./components/DetailedExercise";
import Users from "./components/Users";
import User from "./components/User";
import Settings from "./components/Settings";
import Home from "./components/Home";

import "./App.css";

const Container = styled.div`
  max-width: 100vw;
  box-sizing: border-box;
  padding: 2rem 4rem;
`;

const MainContent = styled.div`
  max-width: 100%;
`;

const Title = styled.h2`
  font-weight: bold;
  margin: 0;
  color: #3e21de;
  ${"" /* margin-bottom: 2rem; */};
`;

const Logo = styled.h1`
  font-weight: bold;
  margin: 0;
  color: #3e21de;
`;

const Menu = styled.div`
  & > * {
    margin-right: 1rem;
  }
  & > *:last-child {
    margin-right: 0;
  }
`;

const Nav = styled.nav`
  box-sizing: content-box;
  width: 100%;
  height: 64px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const getTitle = () => {
  const pathname = window.location.pathname.split("/")[1];
  console.log(pathname);

  if (pathname === "") return "Home";
  else if (pathname === "settings") return "Settings";
  else if (pathname === "user") return "User";
  else if (pathname === "users") return "User";
  else if (pathname === "exercises") return "Exercises";
  else if (pathname === "exercise") return "Exercise";
  else return "";
};

function App() {
  const [title, setTitle] = useState("");

  useEffect(() => setTitle(getTitle()), []);

  return (
    <Router>
      <Container>
        <Nav>
          <Title style={{ textDecoration: "none" }}> {title}</Title>
          <Menu>
            <Link
              to="/"
              style={{ textDecoration: "none" }}
              onClick={() => setTitle("Home")}
            >
              Home
            </Link>
            <Link
              to="/users/"
              style={{ textDecoration: "none" }}
              onClick={() => setTitle("Users")}
            >
              Users
            </Link>
            <Link
              to="/exercises/"
              style={{ textDecoration: "none" }}
              onClick={() => setTitle("Exercises")}
            >
              Exercises
            </Link>
            <Link
              to="/settings"
              style={{ textDecoration: "none" }}
              onClick={() => setTitle("Settings")}
            >
              Settings
            </Link>
          </Menu>
        </Nav>

        <MainContent>
          <Route path="/" exact component={Home} />
          <Route path="/settings" exact component={Settings} />
          <Route path="/exercises/" exact component={Exercises} />
          <Route path="/users/" exact component={Users} />
          <Route path="/user/:id" exact component={User} />
          <Route path="/exercise/:id" exact component={Exercise} />
        </MainContent>
      </Container>
    </Router>
  );
}

export default App;
