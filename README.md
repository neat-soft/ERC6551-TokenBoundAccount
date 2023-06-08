# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm install`

Install all required npm modules

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
Run this cli in your local only.\
The page will reload when you make changes.\
You may also see any lint errors in the console.

***Run server as a daemon with pm2 in your server.***

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Start app with pm2

**Install pm2**

> PM2 is a daemon process manager that will help you manage and keep your application online.\
> Install pm2 run by  `npm install pm2 -g`

**Run with pm2**

> `pm2 start npm -- start`

## Edit .env

**PORT**: Default is 3003 \
**REACT_APP_API_URL**: your backend url Default: http://localhost:3030/api\
Change it to your server ip or domain \
**REACT_APP_Factory_Address**: ERC6551 Registry contract address \
**REACT_APP_Implementation_Address** ERC6551 Acount contract address
