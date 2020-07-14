import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Input from "./UI/Input";
import { Button } from "evergreen-ui";
import cogoToast from "cogo-toast";
import { Redirect } from "react-router-dom";

const Form = styled.form`
  margin: 1rem;
  padding: 1.5rem;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;

  width: 300px;

  & > button {
    width: 100%;
  }
`;

function Home({}) {
  const [name, setName] = useState("");
  const [exerciseId, setExerciseId] = useState("");
  const [exerciseName, setExerciseName] = useState("");

  function createUser(e) {
    e.preventDefault();
    axios({
      method: "POST",
      headers: { "content-type": "application/json" },
      data: JSON.stringify({ name }),
      url: "http://localhost:8000/user",
    }).then((res) => {
      if (res.status === 200) {
        cogoToast.success(`Your user \"${name}\" created successfully! 🎉`);
      }
    });
  }

  function renameExercise(e) {
    e.preventDefault();

    axios({
      method: "PUT",
      headers: { "content-type": "application/json" },
      data: JSON.stringify({ name: exerciseName, id: exerciseId }),
      url: "http://localhost:8000/exercise",
    });
  }
  return <Redirect to="/users" />;
  return (
    <div>
      <p>Total Users: </p>
      <p>Total Exercises: </p>
      <p>Average samples per exercise: </p>
      <p>Last exercise: </p>
    </div>
  );
}

export default Home;
