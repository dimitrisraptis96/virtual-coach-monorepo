import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";

const Container = styled.div`
  width: 100%;
  padding: 1rem;

  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-radius: 16px;
`;

function deleteExercise(id) {
  axios.delete("http://localhost:8000/exercise/" + id).then(response => {
    alert("Deleted");
  });
}

function Exercise({ match }) {
  const { id } = match.params;

  const [exercise, setExercise] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    axios({
      method: "get",
      url: "http://localhost:8000/exercise/" + id
    }).then(response => {
      setExercise(response.data);
      setIsReady(true);
    });
  }, []);
  return (
    <Container>
      {isReady && (
        <div>
          <h2>{exercise.name}</h2>
          <div
            onClick={() => deleteExercise(id)}
            style={{ color: "red", cursor: "pointer" }}
          >
            Delete exercise
          </div>
          <Line
            data={{
              labels: Array.from(
                Array(exercise.samples.length),
                (x, index) => index
              ),
              datasets: [
                {
                  label: "x",
                  data: exercise.samples.map(sample => sample.x),
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  pointBorderWidth: 1,
                  pointRadius: 1
                },
                {
                  label: "y",
                  data: exercise.samples.map(sample => sample.y),
                  borderColor: "rgba(192, 192, 192, 1)",
                  backgroundColor: "rgba(192, 192, 192, 0.2)",
                  pointRadius: 1
                },
                {
                  label: "z",
                  data: exercise.samples.map(sample => sample.z),
                  borderColor: "rgba(230, 0, 0, 1)",
                  backgroundColor: "rgba(230, 0, 0, 0.2)",
                  pointRadius: 1
                },
                {
                  label: "w",
                  data: exercise.samples.map(sample => sample.w),
                  borderColor: "rgba(192, 0, 192, 1)",
                  backgroundColor: "rgba(192, 0, 192, 0.2)",
                  pointRadius: 1
                }
              ]
            }}
            options={{
              scales: {
                xAxes: [
                  {
                    display: false
                  }
                ]
              }
            }}
          />
          <div>
            <p>
              Reps: <b>{exercise.reps}</b>
            </p>
            <p>
              Calories: <b>{exercise.calories}</b>
            </p>
            <p>
              Samples: <b>{exercise.samples.length}</b>
            </p>
            <Link to={"/user/" + exercise.user}>Go to user</Link>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Exercise;
