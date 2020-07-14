import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Line, Scatter } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { min, max, median, quantile } from "simple-statistics";
import dft from "../utils/discreteFourierTransform";
import d3_peaks, { findPeaks } from "d3-peaks";
import KalmanFilter from "kalmanjs";
import GymBuddy from "./GymBuddy";
import { Button } from "evergreen-ui";

import {
  FiTrash,
  FiUser,
  FiSave,
  FiBarChart2,
  FiFilm,
  FiStopCircle,
  FiPlay,
  FiPlayCircle,
  FiActivity,
  FiTrendingUp,
  FiBattery,
  FiClock,
} from "react-icons/fi";

import { Boxplot, computeBoxplotStats } from "react-boxplot";

const Container = styled.div`
  width: 100%;
  margin: 2rem 0;
  padding: 2rem;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
`;

const Metrics = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 2rem;

  & > p > b {
    font-size: 18px;
  }
  & > p {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    & > * + * {
      margin-top: 0.5rem;
    }
  }

  .unit {
    opacity: 0.5;
    font-size: 14px;
    color: #3e21deaa;
  }
  .label {
    margin-right: 0.25rem;
    font-size: 14px;
    color: #3e21de;
  }

  & > * + * {
    margin-left: 1.5rem;
  }
`;

const SpaceBetween = styled.div`
  width: 100%;

  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Row = styled.div`
  width: 100%;

  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  & > *:nth-child(3) {
    max-width: 30%;
  }

  & > *:nth-child(1),
  & > *:nth-child(2) {
    max-width: 70%;
  }
`;

function statistics(data) {
  const x = data.map((d) => d.x);
  const y = data.map((d) => d.y);
  const z = data.map((d) => d.z);
  const w = data.map((d) => d.w);

  return {
    min: [min(x), min(y), min(z), min(w)],
    max: [max(x), max(y), max(z), max(w)],
    median: [median(x), median(y), median(z), median(w)],
    quantile1: [
      quantile(x, 0.25),
      quantile(y, 0.25),
      quantile(z, 0.25),
      quantile(w, 0.25),
    ],
    quantile2: [
      quantile(x, 0.5),
      quantile(y, 0.5),
      quantile(z, 0.5),
      quantile(w, 0.5),
    ],
    quantile3: [
      quantile(x, 0.75),
      quantile(y, 0.75),
      quantile(z, 0.75),
      quantile(w, 0.75),
    ],
    dft: [dft(x), dft(y), dft(z), dft(w)],
  };
}
function deleteExercise(id) {
  axios.delete("http://localhost:8000/exercise/" + id).then((response) => {
    alert("Deleted");
  });
}

function jsonToCsv(samples) {
  const header = "x,y,z,w\n";
  const content = samples
    .map((sample) => `${sample.x},${sample.y},${sample.z},${sample.w}\n`)
    .join("");

  return header + content;
}

function calculateDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) +
      Math.pow(point1.y - point2.y, 2) +
      Math.pow(point1.z - point2.z, 2) +
      Math.pow(point1.w - point2.w, 2)
  );
}

function Exercise({ match }) {
  const iframeRef = React.useRef(null);

  const { id } = match.params;

  const [exercise, setExercise] = useState([]);
  const [rotationValue, setRotationValue] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    axios({
      method: "get",
      url: "http://localhost:8000/exercise/" + id,
    }).then((response) => {
      const exercise = response.data;
      const blobData = URL.createObjectURL(
        new Blob([jsonToCsv(exercise.samples)], {
          type: "application/octet-stream",
        })
      );
      setCsvData(blobData);

      setExercise(exercise);

      setIsReady(true);

      initIframe(exercise);
    });
  }, []);

  function initIframe(data) {
    iframeRef.current.onload = function () {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          type: "init",
          positions: data.positions,
          exerciseId: data.type,
        }),
        "http://localhost:8000"
      );
    };
  }
  function sendSampleToIframe(sample) {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ type: "predict", sample: sample }),
        "http://localhost:8000"
      );
    }
  }

  function predictPosition(testingPoint) {
    const pointsBetween = exercise.positions.length;

    const distancesFromPositions = exercise.positions.map((pos) =>
      calculateDistance(pos, testingPoint)
    );
    const minDistance = Math.min(...distancesFromPositions);
    const posIndex = distancesFromPositions.indexOf(minDistance);

    const fractionOfMovement = posIndex / pointsBetween;

    return fractionOfMovement;
  }

  var timerId = null;

  const stop = () => {
    let len = exercise.samples.length;
    while (len--) {
      window.clearTimeout(timerId); // will do nothing if no timeout with id is present
    }
    setRotationValue(0);
    setIsPlaying(false);
  };

  const start = (samples, duration) => {
    setIsPlaying(true);
    samples.forEach(
      (sample, index) =>
        (timerId = setTimeout(() => {
          sendSampleToIframe(sample);
          if (index === samples.length - 1) {
            setIsPlaying(false);
          }
          return;
        }, (index * 1000) / (samples.length / duration)))
    );
  };

  return (
    <Container>
      {isReady && (
        <div>
          <SpaceBetween>
            <h2>{exercise.name}</h2>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <a
                target="_blank"
                href={csvData}
                download={`${exercise.name}.csv`}
                style={{
                  color: "#3E21DE",
                  cursor: "pointer",
                  display: "block",
                  textDecoration: "none",
                  marginRight: "1rem",
                }}
              >
                <FiSave style={{ marginRight: "0.5rem" }} />
                Save as CSV
              </a>

              <Button
                appearance="primary"
                onClick={
                  isPlaying
                    ? () => {}
                    : () => start(exercise.samples, exercise.duration)
                }
                height={40}
                style={{
                  textAlign: "center",
                  backgroundImage: isPlaying
                    ? "linear-gradient(to bottom, #fc4353, #fc4353)"
                    : "linear-gradient(to bottom, #3E21DE, #3E21DE)",
                }}
                type="submit"
              >
                {isPlaying ? (
                  <>
                    <FiStopCircle style={{ marginRight: "0.5rem" }} />{" "}
                    Playing...
                  </>
                ) : (
                  <>
                    <FiPlayCircle style={{ marginRight: "0.5rem" }} /> Play
                  </>
                )}
              </Button>
            </div>
          </SpaceBetween>

          <Metrics>
            <p>
              <span className="label">Calories: </span>
              <b>{exercise.metrics.calories}</b>{" "}
              <span className="unit">kcal</span>
            </p>
            <p>
              <span className="label">Energy: </span>
              <b>{exercise.metrics.energy}</b>{" "}
              <span className="unit">Joule</span>
            </p>
            <p>
              <span className="label">Power: </span>
              <b>{exercise.metrics.power}</b> <span className="unit">Watt</span>
            </p>
            <p>
              <span className="label">Duration: </span>
              <b>{exercise.duration}</b> <span className="unit">sec</span>
            </p>
            <p>
              <span className="label">Reps: </span>
              <b>{exercise.metrics.reps}</b>
            </p>
          </Metrics>

          <Row>
            <p style={{ marginRight: "1.5rem" }}>
              <FiBarChart2 style={{ marginRight: "0.5rem" }} />
              Samples: <b>{exercise.samples.length}</b>
            </p>
          </Row>

          <Link
            to={"/user/" + exercise.user}
            style={{ textDecoration: "none" }}
          >
            <FiUser style={{ marginRight: "0.5rem" }} />
            Go to user
          </Link>

          <Row>
            <Line
              data={{
                labels: Array.from(
                  Array(exercise.samples.length),
                  (x, index) => index
                ),
                datasets: [
                  {
                    label: "x",
                    data: exercise.samples.map((sample) => sample.x),
                    borderColor: "rgba(245, 65, 65, 1)",
                    backgroundColor: "rgba(245, 65, 65, 0.1)",
                    pointBorderWidth: 1,
                    pointRadius: 1,
                  },

                  {
                    label: "y",
                    data: exercise.samples.map((sample) => sample.y),
                    borderColor: "rgba(56, 201, 119, 1)",
                    backgroundColor: "rgba(56, 201, 119, 0.1)",
                    pointRadius: 1,
                  },
                  {
                    label: "z",
                    data: exercise.samples.map((sample) => sample.z),
                    borderColor: "rgba(56, 105, 201, 1)",
                    backgroundColor: "rgba(56, 105, 201, 0.1)",
                    pointRadius: 1,
                  },
                  {
                    label: "w",
                    data: exercise.samples.map((sample) => sample.w),
                    borderColor: "rgba(201, 187, 56, 1)",
                    backgroundColor: "rgba(201, 187, 56, 0.1)",
                    pointRadius: 1,
                  },
                ],
              }}
              options={{
                scales: {
                  xAxes: [
                    {
                      display: false,
                    },
                  ],
                },
              }}
            />
            <iframe
              src={"http://localhost:8000/dashboard"}
              ref={iframeRef}
              sandbox
              style={{
                border: "2px dashed rgb(62, 33, 222)",
                borderRadius: "8px",
                margin: "1rem",
              }}
            ></iframe>
            {/* <GymBuddy rotationValue={rotationValue} /> */}
          </Row>

          <div
            onClick={() => deleteExercise(id)}
            style={{
              color: "red",
              cursor: "pointer",
              margin: "1rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <FiTrash style={{ marginRight: "0.5rem" }} /> Delete exercise
          </div>
        </div>
      )}
    </Container>
  );
}

export default Exercise;
