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

## Initial API Setup

During the first run of the API, it sets itself up and creates an admin user based on the configuration. Additionally, a cron job is set up to run every day and delete unauthenticated accounts. This ensures the security and integrity of the system.

## License

The Financial Table App is licensed under the MIT license.
