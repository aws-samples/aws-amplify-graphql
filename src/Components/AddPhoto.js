import React, { Component } from "react";
import { graphql } from "react-apollo";
import { MutationCreatePicture, QueryListPictures } from "../GraphQL";
import { v4 as uuid } from "uuid";

import { Form, Icon } from "semantic-ui-react";

import { Auth } from "aws-amplify";

import axios from "axios";
import aws4 from "aws4";

class AddPhoto extends Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();
    this.fileInput = {};

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  getInitialState = () => ({
    name: "",
    file: undefined,
    lastUpdate: new Date().toISOString()
  });

  handleChange(field, event) {
    const {
      target: { value, files }
    } = event;
    const [file] = files || [];
    this.setState({
      [field]: file || value
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const { bucket, region } = this.props.options;
    const visibility = "private";
    const { name, file: selectedFile } = this.state;
    const { identityId } = await Auth.currentCredentials();
    const curUser = await Auth.currentUserInfo();
    const { username: owner } = curUser;

    console.log(curUser);

    const param = {
      identityId: identityId
    };

    const request = {
      host: "storage.execute-api.eu-west-1.amazonaws.com",
      method: "POST",
      url: "https://b8gkxapk0d.execute-api.eu-west-1.amazonaws.com/prod/prod/",
      path: "/prod/prod",
      data: param,
      body: JSON.stringify(param),
      headers: {
        "content-type": "application/json"
      }
    };

    let signedRequest = aws4.sign(request, {
      secretAccessKey: "AKIAIY6NB26ASLS6BMYQ",
      accessKeyId: "Vyr9ASyZg1nksFtH4/OkV/tpJSw3aaX59XnDPSvH"
    });

    delete signedRequest.headers["Host"];
    delete signedRequest.headers["Content-Length"];

    let response = await axios(signedRequest);

    const bucketSize = response.data.body;
    const calculatedSize = bucketSize + selectedFile.size;
    console.log("bucketSize", bucketSize);

    let file;

    const limit = 1073741824; // 1gb

    if (calculatedSize > limit) {
      alert(
        `You can't upload this file because your storage is limited ${limit /
          (1024 * 1024)}MB`
      );
      return;
    }

    if (selectedFile) {
      const { name: fileName, type: mimeType } = selectedFile;
      const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(fileName);

      const key = `${visibility}/${identityId}/${uuid()}${extension &&
        "."}${extension}`;

      file = {
        bucket,
        key,
        region,
        mimeType,
        localUri: selectedFile
      };
    }

    this.setState(this.getInitialState(), () => {
      this.fileInput.value = "";
      this.props.createPicture({ name, owner, visibility, file });
    });
  }

  render() {
    const isSubmitEnabled =
      this.state.name !== "" && this.state.file !== undefined;
    return (
      <fieldset>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Input
              label="Friendly name"
              type="text"
              placeholder="Title"
              value={this.state.name}
              onChange={this.handleChange.bind(this, "name")}
            />
            <Form.Input
              key={this.state.lastUpdate}
              label="File to upload"
              type="file"
              onChange={this.handleChange.bind(this, "file")}
            />
            <Form.Button
              icon
              labelPosition="right"
              label="GraphQL mutation"
              type="submit"
              disabled={!isSubmitEnabled}
            >
              <Icon name="upload" />
              Add File
            </Form.Button>
          </Form.Group>
        </Form>
      </fieldset>
    );
  }
}

export default graphql(MutationCreatePicture, {
  options: {
    update: (proxy, { data: { createPicture } }) => {
      const query = QueryListPictures;
      const data = proxy.readQuery({ query });
      data.listPictures.items = [
        ...data.listPictures.items.filter(
          photo => photo.id !== createPicture.id
        ),
        createPicture
      ];
      proxy.writeQuery({ query, data });
    }
  },
  props: ({ ownProps, mutate }) => ({
    createPicture: photo =>
      mutate({
        variables: { input: photo },
        optimisticResponse: () => ({
          createPicture: {
            ...photo,
            id: uuid(),
            createdAt: new Date().toISOString(),
            __typename: "Picture",
            file: { ...photo.file, __typename: "S3Object" }
          }
        })
      })
  })
})(AddPhoto);
