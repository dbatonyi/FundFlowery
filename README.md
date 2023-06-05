# FundFlowery Documentation

**Author:** dbatonyi

The Financial Table App is a web application that allows users to create and manage their own financial tables. With this app, users can create income and outgoing cards to track their financial activities. The app also provides a calculation feature that allows users to see how much money they have left on a monthly and overall basis.

The app is built on a user-friendly interface that makes it easy for users to manage their finances. Users can also invite other users to their tables, allowing them to collaborate and manage their finances together.

## Features

- Create and manage financial tables
- Create income and outgoing cards to track finances
- Calculation feature to see monthly and overall remaining funds
- Invite other users to collaborate and manage finances together

## Upcoming Features

In the future, the Financial Table App will introduce a complex statistical addon. This addon will provide more advanced analysis of user financial data, giving users a more in-depth understanding of their finances.

Later plans include creating a mobile version where machine learning will scan the receipt based on an image and populate the relevant items.

## Technology Stack

The Financial Table App is built with the following technologies:

- Frontend: Next.js
- Backend: Node.js, Express.js, Sequelize.js
- Database: SQL

## Installation

To install the app, follow these steps:

1. Clone the repository
2. Install dependencies with `npm install-ff`
3. Start the server with `npm start-ff`
4. Visit `http://localhost:3000` to use the app

### API Configuration

After cloning the repository, navigate to the `api` folder. Inside the `api` folder, create a file named `config.js` based on the provided `config-example.js` file. You can use the following command to create the file:

```bash
cp config-example.js config.js
```

In the `config.js` file, you can configure various settings for the API. If you connect to the database using a UNIX socket connection, make sure to declare the `socketPath` key in the `database` object. Otherwise, you can omit it.

```javascript
// api/config.js

module.exports = {
  // Other configurations...

  database: {
    username: "your_username",
    password: "your_password",
    database: "your_database",
    host: "localhost",
    dialect: "mariadb",
    // Uncomment the following line if connecting via UNIX socket
    // socketPath: '/path/to/socket',
  },

  // Other configurations...
};
```

Make sure to replace `'your_username'`, `'your_password'`, and `'your_database'` with the actual credentials and database name.

## Initial API Setup

During the first run of the API, it sets itself up and creates an admin user based on the configuration. Additionally, a cron job is set up to run every day and delete unauthenticated accounts. This ensures the security and integrity of the system.

## License

The Financial Table App is licensed under the MIT license.
