import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Container = styled.div`
  padding: 2rem;
`;

const UserContainer = styled.div`
  width: 600px;
  padding: 1rem;

  display: flex;
  flex-direction: column;

  background-color: #f5f5f5;
  border-radius: 16px;
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

function Users() {
  const [users, setUsers] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    axios({
      method: "get",
      url: "http://localhost:8000/users"
    }).then(response => {
      setUsers(response.data);
      setIsReady(true);
    });
  }, []);

  return (
    <Container>
      {isReady ? (
        <ListContainer>
          {users.map(user => (
            <UserContainer>
              <h2>{user.name}</h2>
              <p>
                Number of exercises: <b>{user.exercises.length}</b>
              </p>
              <Link to={"/user/" + user._id}> Show user profile</Link>
            </UserContainer>
          ))}
        </ListContainer>
      ) : (
        <p>Wait to fetch the users...</p>
      )}
    </Container>
  );
}

export default Users;
