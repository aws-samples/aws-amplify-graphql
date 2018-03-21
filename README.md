# AWS AppSync GraphQL Photo Sample

![Demo](media/demo.gif)

This sample application shows how to use GraphQL to build an application that a user can login to the system, then upload and download photos which are private to them. The sample is written in React and uses AWS AppSync, Amazon Cognito, Amazon DynamoDB and Amazon S3 as well as the AWS Mobile CLI.

## Architecture Overview
![Architecture](media/architecture_diagram.png)

## Prerequisites
+ [AWS Account](https://aws.amazon.com/mobile/details/)

+ [NodeJS](https://nodejs.org/en/download/) with [NPM](https://docs.npmjs.com/getting-started/installing-node)

+ [AWS Mobile CLI](https://github.com/aws/awsmobile-cli)
  - `npm install -g awsmobile-cli`


## Getting Started
1. Clone this repo locally.

2. Navigate to the [AWS AppSync Console](https://us-east-2.console.aws.amazon.com/appsync/home). Select **Create API** with a name of **Pictures**, select **Custom Schema** and click **Create**.

3. Click **Schema** navigation on the left. Copy the contents of `./AppSync/schema.graphql` into the console editor and press **Save**. 

4. Still on the Schema page, press **Create Resources** in the upper right corner.
  - Select the **Picture** type from the drop down. 
  - Then click on **Additional Indexes** followed by **Add Index**, set the index name as **owner-index** with Primary key as **owner** and sort key as **id**.
  - And finally click **Create** at the bottom.

    This will create DynamoDB tables, some default queries/mutations and connect them to Resolvers

5. Click the **Attach** button next to `addPicture` on the right of the schema editor and select **PictureTable** as the data source. For the request mapping template use the code in `./AppSync/Mutation.addPicture.request` and for the response mapping template select **Return single item** from the drop-down. Press **Save** at the bottom.

6. Click the **Data Sources** navigation on the left, select **New** and create a data source with **None** as the type with a name of **Local**. 

7. Go back to the Schema page and on the right hand side under the **Picture** type click the **Attach** button next to the `file:S3Object` field and select the **Local** data source that you just created. For the request mapping template use the code in `./AppSync/Picture.file.request` and for the response mapping template use `./AppSync/Picture.file.response`. Press **Save** at the bottom.

8. Navigate to the Schema page again and on the right hand side find `listPictures(...):[PictureConnection]` under the Query type and click the resolver to edit it.  Update the **REQUEST** mapping template with the code in `./AppSync/Query.listPictures.request`. Use "Return single item" as the response template. Press **Save** at the bottom.
    - This will use fine grained authorization controls to filter GraphQL responses so that users only see their data from DynamoDB.

9. Now use the [awsmobile-cli](https://github.com/aws/awsmobile-cli) to create your Amazon Cognito User Pool and Identity Pool, as well as an Amazon S3 bucket with private directories to store each user's photo:

```
cd ./photo-client
awsmobile init --yes
awsmobile user-signin enable
awsmobile user-files enable
awsmobile push
```

This process will configure all the per-user security settings when users register and login to your application, and automatically download the configuration file to `./photo-client/src/aws-exports.js`. The sample uses [AWS Amplify](https://github.com/aws/aws-amplify) to perform the Sign-Up and Sign-In flows with a Higher Order Component.

10. On AppSync console, click the **Settings** tab on the left and select **Amazon Cognito User Pool** as the _Authorization Type_. 
  - Select user pool region
  - Select the user pool (You can type **photo** and that will filter the user pool)
  - Set default action **ALLOW**
  - Click **Save**.

11. On the left navigation of the AppSync console, select the root of your API (called **Pictures**) and scroll down to the bottom where **Web** is listed. Click the **Download** button and save the `AppSync.js` file into the `./photo-client/src` directory.


12. Finally in a terminal navigate to your cloned repo and run the application:

```
cd ./photo-client
yarn start
```

If the application runs successfully you should be able to enter the name of a photo, choose a file and then press **Add photo**. This will make a GraphQL call to enter the record into the database and simultaneously upload the object to S3. An immediate fetch of the record will then be at the bottom of the screen.

## NOTE 
The existing CORS configuration on the Amazon S3 bucket that is configured by awsmobile-cli has a size limit of 5MB. In order to support file uploads larger than this you need to go Amazon S3 console, open your bucket (photoclient-userfiles-mobilehub-XXXXXXXXXXX), then go to **Permissions** tab and click on **CORS Configuration**. Then inside of the CORSRule tag add this line ```<ExposeHeader>ETag</ExposeHeader>``` and click **Save**.
