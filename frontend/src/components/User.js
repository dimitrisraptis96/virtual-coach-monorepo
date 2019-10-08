import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import Exercise from "./Exercise";

const Container = styled.div`
  padding: 2rem;
`;

const UserContainer = styled.div`
  width: 100%

  display: flex;
  flex-direction: column;
`;

const List = styled.div`
  width: 100%

  display: flex;
  flex-direction: column;
`;

function User({ match }) {
  const [user, setUser] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const { id } = match.params;

  useEffect(() => {
    axios({
      method: "get",
      url: `http://localhost:8000/user/${id}`
    }).then(response => {
      setUser(response.data);
      setIsReady(true);
    });
  }, []);

  return (
    <Container>
      {isReady ? (
        <UserContainer>
          <h1>{user.name}</h1>
          <List>
            {user.exercises.map(exercise => (
              <Exercise
                samples={exercise.samples}
                reps={exercise.reps}
                calories={exercise.calories}
                name={exercise.name}
                user={exercise.user}
                username={user.name}
                id={exercise._id}
              />
            ))}
          </List>
        </UserContainer>
      ) : (
        <p>Wait to fetch the user...</p>
      )}
    </Container>
  );
}

export default User;
