# tarpaulinAPI
## Contents
- [Project Overview](#project-overview)
- [API Connection](#api-connections)
- [Setup](#setup)
    

## Project Overview
This application is a lightweight course management tool. This application is compared to the Canvas page we use for OSU Cascades. Tarpaulin allows users (instructors and students) to see information about courses they are teaching/taking. This application will support endpoints based on the tarpualon_openapi_spec.
## API Connections
We have created different API diagrams for the data layout and the architecture.

API Data Layout

![API Data Layout](./media/API_Data_Layout.png)

API Architecture

![API Architecture](./media/API_architecture.png)

## Setup
1.  To start the Program you must first launch Docker Desktop
    
![alt text](./media/Docker%20Desktop.png)

2.  If the docker has not been built yet run:
```
docker compose up --build
```
3.  If the Docker has been built run:
```
docker compose up
```
4.  If you want to run Curl commands you will need to start a new terminal



