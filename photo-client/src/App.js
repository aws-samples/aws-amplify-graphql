import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import 'semantic-ui-css/semantic.min.css'

//Get configs
import awsmobile from './aws-exports';

//AppSync and Apollo libraries
import AWSAppSyncClient from "aws-appsync";
import { Rehydrated } from 'aws-appsync-react';
import { ApolloProvider } from 'react-apollo';

//Amplify
import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';

// Components
import AllPhotos from "./Components/AllPhotos";
import AddPhoto from "./Components/AddPhoto";

// Amplify init
Amplify.configure(awsmobile);

// AppSync client instantiation
const client = new AWSAppSyncClient({
  disableOffline: true,
  url: awsmobile.aws_appsync_graphqlEndpoint,
  region: awsmobile.aws_appsync_region,
  auth: {
    type: awsmobile.aws_appsync_authenticationType,

    // API_KEY
    apiKey: 'some_key',

    // AWS_IAM
    credentials: () => Auth.currentCredentials(),

    // COGNITO USER POOLS
    jwtToken: async () => (await Auth.currentSession()).getAccessToken().getJwtToken(),
  },
  complexObjectsCredentials: () => Auth.currentCredentials(),
});

class App extends Component {

  async componentWillMount() {
    client.initQueryManager();
    await client.resetStore();
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">AWS Amplify with AWS AppSync Sample using Complex Objects </h1>
        </header>
        <div className="App-content">
          <AddPhoto options={{ bucket: awsmobile.aws_user_files_s3_bucket, region: awsmobile.aws_user_files_s3_bucket_region }} />
          <AllPhotos />
        </div>
      </div>
    );
  }
}

const AppWithAuth = withAuthenticator(App, true);

export default () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <AppWithAuth />
    </Rehydrated>
  </ApolloProvider>
);
