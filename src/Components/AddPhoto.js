import React, { Component } from "react";
import { graphql } from 'react-apollo';
import { MutationCreatePicture, QueryListPictures } from "../GraphQL";
import { v4 as uuid } from 'uuid';

import { Form, Icon } from 'semantic-ui-react'

import { Auth } from "aws-amplify";

class AddPhoto extends Component {

    constructor(props) {
        super(props);

        this.state = this.getInitialState();
        this.fileInput = {};

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    getInitialState = () => ({
        name: '',
        file: undefined,
        lastUpdate: new Date().toISOString()
    });

    handleChange(field, event) {
        const { target: { value, files } } = event;
        const [file,] = files || [];
        this.setState({
            [field]: file || value
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        const { bucket, region } = this.props.options;
        const visibility = 'private';

        const { name, file: selectedFile } = this.state;
        const { identityId } = await Auth.currentCredentials();
        const { username: owner } = await Auth.currentUserInfo();

        let file;

        if (selectedFile) {
            const { name: fileName, type: mimeType } = selectedFile;
            const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(fileName);

            const key = `${visibility}/${identityId}/${uuid()}${extension && '.'}${extension}`;

            file = {
                bucket,
                key,
                region,
                mimeType,
                localUri: selectedFile,
            };
        }

        this.setState(this.getInitialState(), () => {
            this.fileInput.value = "";
            this.props.createPicture({ name, owner, visibility, file });
        });
    }

    render() {
        const isSubmitEnabled = this.state.name !== '' && this.state.file !== undefined;
        return (
            <fieldset>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Group >
                        <Form.Input label="Friendly name" type="text" placeholder="Title" value={this.state.name} onChange={this.handleChange.bind(this, 'name')} />
                        <Form.Input key={this.state.lastUpdate} label="File to upload" type="file" onChange={this.handleChange.bind(this, 'file')} />
                        <Form.Button icon labelPosition="right" label="GraphQL mutation" type="submit" disabled={!isSubmitEnabled}><Icon name="upload" />Add Photo</Form.Button>
                    </Form.Group>
                </Form>
            </fieldset>
        );
    }
}

export default graphql(
    MutationCreatePicture,
    {
        options: {
            update: (proxy, { data: { createPicture } }) => {
                const query = QueryListPictures;
                const data = proxy.readQuery({ query });
                data.listPictures.items = [
                    ...data.listPictures.items.filter((photo) => photo.id !== createPicture.id),
                    createPicture
                ];
                proxy.writeQuery({ query, data });
            }
        },
        props: ({ ownProps, mutate }) => ({
            createPicture: photo => mutate({
                variables: { input: photo },
                optimisticResponse: () => ({
                    createPicture: {
                        ...photo,
                        id: uuid(),
                        createdAt: new Date().toISOString(),
                        __typename: 'Picture',
                        file: { ...photo.file, __typename: 'S3Object' }
                    }
                }),
            }),
        }),
    }
)(AddPhoto);
