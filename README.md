# VirtualCoach system

**Live URL:** https://flex-your-muscle.netlify.com/

## Requirements

- JavaScript
- npm or yarn package installer
- MongoDB

## How to run it

You have to install the Android app that is available [here](https://github.com/dimitrisraptis96/virtualcoach-android-app)

Then, the local development needs three servers: 

### 1. MongoDB server
Where all the data are saved. You have to run the mongo server at the beggining with the following bash command:

`mongod`

### 2. Backend server 
The backend server uses a Restful API. It creates/saves/edits all the user's data and serves the Three.js views for the Android app and the gym's dashboard.

To install the backend dependencies run the following commands:
```
cd server
yarn
```

### 3. Frontend server
The React server serves the gym's dashboard that handles the data visualization.

To install the frontend dependencies run the following commands:
```
cd frontend
yarn
```

To start backend and frontend server cuncurrently you have to run the following command from the root directory:

 `yarn start`

Enjoy your workout 🏃
