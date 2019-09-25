import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Input from "./UI/Input";
import { Button } from "evergreen-ui";
import cogoToast from "cogo-toast";

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
      url: "http://localhost:8000/user"
    }).then(res => {
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
      url: "http://localhost:8000/exercise"
    });
  }

  return (
    <div>
      <Form onSubmit={createUser}>
        <Input
          name="username"
          label="User Name"
          value={name}
          onChange={setName}
        />
        <Button
          appearance="primary"
          onClick={createUser}
          height={40}
          style={{ textAlign: "center" }}
          type="submit"
        >
          Create User
        </Button>
      </Form>
      <Form onSubmit={renameExercise}>
        <Input
          name="exerciseId"
          label="Exercise ID"
          value={exerciseId}
          onChange={setExerciseId}
        />
        <Input
          name="name"
          label="New Name"
          value={exerciseName}
          onChange={setExerciseName}
        />
        <Button
          appearance="primary"
          onClick={renameExercise}
          height={40}
          style={{ textAlign: "center" }}
          type="submit"
        >
          Rename Exercise
        </Button>
      </Form>
    </div>
  );
}

export default Home;
