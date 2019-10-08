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
  FiPlayCircle
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
  const x = data.map(d => d.x);
  const y = data.map(d => d.y);
  const z = data.map(d => d.z);
  const w = data.map(d => d.w);

  return {
    min: [min(x), min(y), min(z), min(w)],
    max: [max(x), max(y), max(z), max(w)],
    median: [median(x), median(y), median(z), median(w)],
    quantile1: [
      quantile(x, 0.25),
      quantile(y, 0.25),
      quantile(z, 0.25),
      quantile(w, 0.25)
    ],
    quantile2: [
      quantile(x, 0.5),
      quantile(y, 0.5),
      quantile(z, 0.5),
      quantile(w, 0.5)
    ],
    quantile3: [
      quantile(x, 0.75),
      quantile(y, 0.75),
      quantile(z, 0.75),
      quantile(w, 0.75)
    ],
    dft: [dft(x), dft(y), dft(z), dft(w)]
  };
}
function deleteExercise(id) {
  axios.delete("http://localhost:8000/exercise/" + id).then(response => {
    alert("Deleted");
  });
}

function jsonToCsv(samples) {
  const header = "x,y,z,w\n";
  const content = samples
    .map(sample => `${sample.x},${sample.y},${sample.z},${sample.w}\n`)
    .join("");

  return header + content;
}
function Exercise({ match }) {
  const { id } = match.params;

  const [exercise, setExercise] = useState([]);
  const [rotationValue, setRotationValue] = useState([]);
  const [xData, setXData] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [stats, setStats] = useState(null);
  const [data, setData] = useState([]);
  const [csvData, setCsvData] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    axios({
      method: "get",
      url: "http://localhost:8000/exercise/" + id
    }).then(response => {
      var kalmanFilterX = new KalmanFilter({ R: 0.01, Q: 5 });
      var kalmanFilterY = new KalmanFilter({ R: 0.01, Q: 5 });
      var kalmanFilterZ = new KalmanFilter({ R: 0.01, Q: 5 });
      var kalmanFilterW = new KalmanFilter({ R: 0.01, Q: 5 });

      const exercise = {
        ...response.data,
        samples: response.data.samples.slice(1).map(sample => ({
          ...sample,
          x: kalmanFilterX.filter(sample.x),
          y: kalmanFilterY.filter(sample.y),
          y: kalmanFilterZ.filter(sample.z),
          w: kalmanFilterW.filter(sample.w)
        }))
      };

      setXData(exercise.samples.map(sample => sample.x));

      // const data = exercise.samples.map(sample => sample.x);
      // function nearestPow2(aSize) {
      //   return Math.pow(2, Math.round(Math.log(aSize) / Math.log(2)));
      // }
      // const size = nearestPow2(data.length);
      // const f = new FFT(size);
      // const out = f.createComplexArray();
      // f.realTransform(out, data);
      // setData(out);

      const blobData = URL.createObjectURL(
        new Blob([jsonToCsv(exercise.samples)], {
          type: "application/octet-stream"
        })
      );
      setCsvData(blobData);

      setExercise(exercise);

      setStats(statistics(exercise.samples));
      setIsReady(true);
    });
  }, []);

  var spectrum = [];

  const stop = () => {
    var id = window.setTimeout(function() {}, 0);

    while (id--) {
      window.clearTimeout(id); // will do nothing if no timeout with id is present
    }
    setRotationValue(0);
    setIsPlaying(false);
  };

  const start = () => {
    // const min = stats.quantile1[0];
    // const max = stats.quantile3[0];
    const min = stats.min[0];
    const max = stats.max[0];

    const getValue = x => {
      if (x < min) return 0;
      if (x > max) return 1;
      const normX = (x - min) / (max - min);
      return normX;
    };

    const data = exercise.samples.map(sample => sample.x);
    setIsPlaying(true);
    data.forEach((value, index) =>
      setTimeout(() => {
        setRotationValue(getValue(value));
        if (index === data.length - 1) {
          setIsPlaying(false);
        }
      }, index * (1000 / 60))
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
                alignItems: "center"
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
                  marginRight: "1rem"
                }}
              >
                <FiSave style={{ marginRight: "0.5rem" }} />
                Save as CSV
              </a>

              <Button
                appearance="primary"
                onClick={isPlaying ? stop : start}
                height={40}
                style={{
                  textAlign: "center",
                  backgroundImage: isPlaying
                    ? "linear-gradient(to bottom, #fc4353, #fc4353)"
                    : "linear-gradient(to bottom, #3E21DE, #3E21DE)"
                }}
                type="submit"
              >
                {isPlaying ? (
                  <>
                    <FiStopCircle style={{ marginRight: "0.5rem" }} /> Stop
                  </>
                ) : (
                  <>
                    <FiPlayCircle style={{ marginRight: "0.5rem" }} /> Play
                  </>
                )}
              </Button>
            </div>
          </SpaceBetween>

          <p>
            <FiBarChart2 style={{ marginRight: "0.5rem" }} />
            Samples: <b>{exercise.samples.length}</b>
          </p>

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
                    data: xData,
                    borderColor: "rgba(245, 65, 65, 1)",
                    backgroundColor: "rgba(245, 65, 65, 0.2)",
                    pointBorderWidth: 1,
                    pointRadius: 1
                  },

                  {
                    label: "y",
                    data: exercise.samples.map(sample => sample.y),
                    borderColor: "rgba(56, 201, 119, 1)",
                    backgroundColor: "rgba(56, 201, 119, 0.2)",
                    pointRadius: 1
                  },
                  {
                    label: "z",
                    data: exercise.samples.map(sample => sample.z),
                    borderColor: "rgba(56, 105, 201, 1)",
                    backgroundColor: "rgba(56, 105, 201, 0.2)",
                    pointRadius: 1
                  },
                  {
                    label: "w",
                    data: exercise.samples.map(sample => sample.w),
                    borderColor: "rgba(201, 187, 56, 1)",
                    backgroundColor: "rgba(201, 187, 56, 0.2)",
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
            <GymBuddy rotationValue={rotationValue} />
          </Row>

          <>
            <div>
              x
              <Boxplot
                width={400}
                height={25}
                orientation="horizontal"
                min={-10}
                max={10}
                stats={computeBoxplotStats(
                  exercise.samples.map(sample => sample.x.toFixed(3) * 10)
                )}
              />
            </div>
            <div>
              y
              <Boxplot
                width={400}
                height={25}
                orientation="horizontal"
                min={-10}
                max={10}
                stats={computeBoxplotStats(
                  exercise.samples.map(sample => sample.y.toFixed(3) * 10)
                )}
              />
            </div>
            <div>
              z
              <Boxplot
                width={400}
                height={25}
                orientation="horizontal"
                min={-10}
                max={10}
                stats={computeBoxplotStats(
                  exercise.samples.map(sample => sample.z.toFixed(3) * 10)
                )}
              />
            </div>
            <div>
              w
              <Boxplot
                width={400}
                height={25}
                orientation="horizontal"
                min={-10}
                max={10}
                stats={computeBoxplotStats(
                  exercise.samples.map(sample => sample.w.toFixed(3) * 10)
                )}
              />
            </div>
          </>
          {/* {stats.dft.map(data => (
            <Line
              width="200px"
              data={{
                labels: data.map((point, index) => index),
                datasets: [
                  {
                    label: "x",
                    data: data.map(point => point.getRadius()),
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    pointBorderWidth: 1,
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
          ))} */}

          <div
            onClick={() => deleteExercise(id)}
            style={{
              color: "red",
              cursor: "pointer",
              margin: "1rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "center"
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
