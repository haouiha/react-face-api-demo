# README

## Server Getting Started

### `Install dependencies`
    npm install

#### Start PostgreSQL from Docker-compose
    docker-compose up -d

#### Migrate database (dev)
   npx prisma migrate dev

#### Seed database
    npx prisma db seed --preview-feature


#### Run development with nodemon

    npm run dev


## Client Getting Started

#### Install dependencies

    yarn install

#### Runs the app in the development mode.
    yarn start
    Open http://localhost:3000 to view it in the browser.
