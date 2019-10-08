import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { rgba } from "polished";
import { Link } from "react-router-dom";
import cogoToast from "cogo-toast";
import YogaIcon from "./Icons/YogaIcon";

const Container = styled.div`
  width: 300px;
  padding: 1rem;
  margin: 1rem 0;

  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 16px;

  & > * {
    margin-right: 2rem;
  }
  & > *:last-child {
    justify-self: flex-end;
    margin-right: 0;
  }

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);

    & > h4 {
      color: #212121;
    }
  }

  & > div > h4 {
    color: #666;
    text-decoration: none;
    margin: 0;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  & > div > p {
    font-size: 12px;
    color: #aaa;
    text-decoration: none;
    margin: 0;
    margin-bottom: 0.25rem;
  }
`;

const Tag = styled.span`
  border: none;
  vertical-align: baseline;
  background: ${props => rgba(props.color, 0.1)} none;
  color: ${props => rgba(props.color, 1)};
  margin: 0 0.25em 0 0;
  padding: 4px;
  text-transform: uppercase;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
`;

function deleteExercise(id) {
  axios.delete("http://localhost:8000/exercise/" + id).then(response => {
    console.log("Deleted the damn exercise");
    cogoToast.success(`Exercise deleted! 👌`);
  });
}

function Exercise({ username, name, reps, samples, calories, user, id }) {
  return (
    <Link to={"/exercise/" + id} style={{ textDecoration: "none" }}>
      <Container>
        <YogaIcon width={80} />
        <div>
          <p>Exercise Name: </p>
          <h4>{name}</h4>
          <Tag color="#212121">{username}</Tag>
        </div>
      </Container>
    </Link>
  );
}

export default Exercise;
