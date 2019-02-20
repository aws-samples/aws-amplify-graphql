# AWS AppSync GraphQL Photo Sample

**Please submit issues to the [appsync-sdk-js](https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues) repository.**

![Demo](public/demo.gif)

This sample application shows how to use GraphQL to build an application that a user can login to the system, then upload and download photos which are private to them. The sample is written in React and uses AWS AppSync, Amazon Cognito, Amazon DynamoDB and Amazon S3 as well as the Amplify CLI.

## Architecture Overview

![Architecture](public/architecture_diagram.png)

## Prerequisites
+ [AWS Account](https://aws.amazon.com/mobile/details/)

+ [NodeJS](https://nodejs.org/en/download/) with [NPM](https://docs.npmjs.com/getting-started/installing-node)

+ [AWS Ampify CLI](https://aws-amplify.github.io/)
  - `npm install -g @aws-amplify/cli`
  - `amplify configure` 

## Getting Started

1. Clone this repo locally.

```
git clone https://github.com/aws-samples/aws-amplify-graphql.git
cd aws-amplify-graphql
```

2. Initialize the amplify project.

```
amplify init
```

3. Configure an Amazon Cognito User Pool to manage user credentials.

```
amplify add auth
```

![Architecture](public/amplify-add-auth.png)

4. Configure an Amazon S3 bucket to store files.

```
amplify add storage
```

![Architecture](public/amplify-add-storage.png)

5. Configure an AWS AppSync API to interact with my backend data sources such as Amazon DynamoDB, Amazon Elasticsearch, AWS Lambda, and self hosted HTTP services. 

```
amplify add api

# When prompted for a schema.graphql provide the value "schema.graphql"
# to point to the file checked in to the root of the project directory.
```

![Architecture](public/amplify-add-api.png)

> After running this command, you edit the schema.graphql located at `amplify/backend/api/<-projectname->/schema.graphql`. You may delete the one at the root of the project directory as it will no longer be used.

6. Deploy your project.

```
amplify push

# When asked if you would like to generate client code, you can
# say no since we are using plain JavaScript.
```

7. Install client dependencies.

```
npm install

# or
yarn
```

8. Run the react application

```
npm run start

# or
yarn start
```

The AWS Amplify CLI will create an Amazon Cognito User Pool and Identity Pool, an Amazon S3 bucket with private directories to store each user's photo and an AWS AppSync API that uses Amazon DynamoDB to store data.

The sample uses [AWS Amplify](https://github.com/aws/aws-amplify) to perform the Sign-Up and Sign-In flows with a Higher Order Component.

If the application runs successfully you should be able to enter the name of a photo, choose a file and then press **Add photo**. This will make a GraphQL call to enter the record into the database and simultaneously upload the object to S3. An immediate fetch of the record will then be at the bottom of the screen.

