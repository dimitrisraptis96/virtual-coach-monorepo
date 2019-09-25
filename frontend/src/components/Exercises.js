import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Exercise from "./Exercise";

const Container = styled.div`
  padding: 2rem;
`;

const ListContainer = styled.div`
  width: 100%

  display: flex;
  flex-direction: column;

  & > div {
    margin-bottom: 1rem;
  }

  & > div:last-child {
    margin-bottom: 1rem;
  }

`;

function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    axios({
      method: "get",
      url: "http://localhost:8000/exercises"
    }).then(response => {
      setExercises(response.data);
      setIsReady(true);
    });
  }, []);

  return (
    <Container>
      {isReady ? (
        <ListContainer>
          {exercises.reverse().map(exercise => (
            <Exercise
              samples={exercise.samples}
              numOfSamples={exercise.numOfSamples}
              reps={exercise.reps}
              calories={exercise.calories}
              name={exercise.name}
              user={exercise.user}
              id={exercise.id}
            />
          ))}
        </ListContainer>
      ) : (
        <p>Wait to fetch the exercises...</p>
      )}
    </Container>
  );
}

export default Exercises;
