import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Link } from "react-router-dom";
import cogoToast from "cogo-toast";

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
    console.log("Deleted the damn exercise");
    cogoToast.success(`Exercise deleted! 👌`);
  });
}

function Exercise({ name, reps, samples, calories, user, id, numOfSamples }) {
  return (
    <Container>
      <h2>{name}</h2>
      <div
        onClick={() => deleteExercise(id)}
        style={{ color: "red", cursor: "pointer" }}
      >
        Delete exercise
      </div>
      {/* <Line
        data={{
          labels: Array.from(Array(samples.length), (x, index) => index),
          datasets: [
            {
              label: "x",
              data: samples.map(sample => sample.x),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              pointBorderWidth: 1,
              pointRadius: 1
            },
            {
              label: "y",
              data: samples.map(sample => sample.y),
              borderColor: "rgba(192, 192, 192, 1)",
              backgroundColor: "rgba(192, 192, 192, 0.2)",
              pointRadius: 1
            },
            {
              label: "z",
              data: samples.map(sample => sample.z),
              borderColor: "rgba(230, 0, 0, 1)",
              backgroundColor: "rgba(230, 0, 0, 0.2)",
              pointRadius: 1
            },
            {
              label: "w",
              data: samples.map(sample => sample.w),
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
      /> */}
      <div>
        <p>
          Reps: <b>{reps}</b>
        </p>
        <p>
          Calories: <b>{calories}</b>
        </p>
        <p>
          Samples: <b>{numOfSamples}</b>
        </p>
        <Link to={"/exercise/" + id}>View Exercise</Link>
      </div>
    </Container>
  );
}

export default Exercise;
