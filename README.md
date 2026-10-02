# AnimeShelf

AnimeShelf is a simple cloud-based anime watchlist application.

Users can add anime to their watchlist, select a watching status, give a rating, and delete anime from the list.

The application is built using Node.js and Express, packaged using Docker, tested automatically using GitHub Actions, and deployed to the cloud using Render.

## Live Demo

https://animeshelf.onrender.com/

##  Technologies Used

- HTML
    
- CSS
    
- JavaScript
    
- Node.js
    
- Express.js
    
- Docker
    
- GitHub
    
- GitHub Actions
    
- Jest
    
- Supertest
    
- Render
    

## Architecture

```text
                    User Browser
                         |
                         v
                 AnimeShelf Frontend
                  HTML / CSS / JS
                         |
                         v
                  Express REST API
                         |
                         v
                 Docker Container
                  Node.js + Express
                         |
                         v
                   Render Cloud
```

### CI/CD Flow

```text
Developer pushes code
          |
          v
       GitHub
          |
          v
   GitHub Actions
          |
          v
   Install dependencies
          |
          v
     Run 5 tests
          |
       PASS
          |
          v
   Cloud deployment
          |
          v
       Render
```

## Features

- View anime in the watchlist
    
- Add a new anime
    
- Select anime watching status
    
- Add a rating out of 10
    
- Delete anime
    
- REST API for anime data
    
- API health-check endpoint
    
- Automated testing
    
- Docker containerization
    
- Cloud deployment
    

## API Endpoints

|Method|Endpoint|Description|
|---|---|---|
|GET|`/api/health`|Checks whether the API is running|
|GET|`/api/anime`|Returns the anime list|
|POST|`/api/anime`|Adds a new anime|
|DELETE|`/api/anime/:id`|Deletes an anime|

## Docker

AnimeShelf is packaged into a Docker container.

The Dockerfile:

1. Uses a Node.js base image
    
2. Creates an application directory
    
3. Installs project dependencies
    
4. Copies the application code
    
5. Exposes the application port
    
6. Starts the Express server
    

To build the image locally:

```bash
docker build -t animeshelf .
```

To run it:

```bash
docker run -p 3000:3000 animeshelf
```

The application can then be opened at:

```text
http://localhost:3000
```

## Testing

The project uses Jest and Supertest.

The automated tests check:

1. Health-check endpoint
    
2. Getting the anime list
    
3. Adding a new anime
    
4. Rejecting an anime without a name
    
5. Deleting an anime
    

Run the tests using:

```bash
npm test
```

## GitHub Actions

GitHub Actions automatically runs the tests whenever code is pushed to the `main` branch or a pull request is created.

The workflow:

```text
Checkout code
      ↓
Install dependencies
      ↓
Run tests
      ↓
PASS / FAIL
```

This helps prevent broken code from being accepted without testing.

## Cloud Deployment

The Dockerized application is deployed using Render.

Render builds the Docker image from the project's Dockerfile and runs the application as a cloud web service.

The application is publicly accessible through its Render URL.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/prxptii/AnimeShelf
```

Enter the project:

```bash
cd AnimeShelf
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

## Future Improvements

- Store anime data in a database
    
- User accounts and authentication
    
- Search and filtering
    
- Anime images and descriptions
    
- Persistent watch history
    
- Anime API integration