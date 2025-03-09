# Vercel Clone - Frontend Deployment platform

This Frontend deployement platform that builds, displays realtime build logs and hosts React frontend application. It takes the users' frontend public gitHub repository link and clones the source code, builds the application and generates a unique URL for the website.

## Features

- <b>Website builder:</b> User can enter their React public git repository URL, and their website will be built and deployed. They will get unique URL for their website.
- <b>Clone | Build | Deploy Logs:</b> User can see all the logs generated white building and deploying their website.

## Tech Stack

- <b>Frontend/Backend:</b> Nextjs 15
- <b>Database and Caching:</b> PostgreSQL, Redis(Hash, List, Pub/Sub)
- <b>UI Framework:</b> Tailwind Css

## Architecture

- ### 3 microservices
    <b>Web:</b> 
    - Clones git repository URL provided by the user.
    - Makes a Socket connection to frontend that is subscribed to Redis Pub/Sub.
    - Publishes logs to Redis Pub/Sub.
    - Uploades code into AWS S3.
    - Sets current build status onto Redis hash.
    - After file upload pushes the id to Redis list.
    
    <b>Builder:</b>
    - Keeps looking for items in Redis list (Queue).
    - Downloads project files from S3.
    - Builds the application.
    - Uploads it back to S3.
    - Updates Redis hash with build complete.
    - Publishes all logs and application URL to Redis Pub/Sub.

    <b>Request Handler:</b>
    - NodeJS Express server handles HTTP requests to the deployed websites.
    - Based on the website URL server the distribution file of the deployed websites.


