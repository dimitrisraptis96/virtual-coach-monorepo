import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { Link } from "react-router-dom";
import UserIcon from "./Icons/UserIcon";

const Container = styled.div`
  padding: 2rem 0;
`;

const UserContainer = styled.div`
  width: 300px;
  padding: 1rem;
  margin: 0.5rem;

  background-color: #f5f5f5;
  border-radius: 16px;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
`;

const ListContainer = styled.div`
  width: 100%

  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  overflow-y: scroll;
  width: 100%;
  min-height: 308px;
  margin-right: 1rem;

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
            <Link
              to={"/user/" + user._id}
              style={{ textDecoration: "none", color: "#212121" }}
            >
              <UserContainer>
                <UserIcon width={40} />
                <h2>{user.name}</h2>
                <p>
                  Number of exercises: <b>{user.exercises.length}</b>
                </p>
              </UserContainer>
            </Link>
          ))}
        </ListContainer>
      ) : (
        <p>Wait to fetch the users...</p>
      )}
    </Container>
  );
}

export default Users;
