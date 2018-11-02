import React, { Component } from "react";
import { graphql } from 'react-apollo';
import { QueryListPictures } from "../GraphQL";

import { Icon, Table, Button, Loader } from 'semantic-ui-react'

import { Storage } from 'aws-amplify';

class AllPhotos extends Component {

    async handleDownload({ visibility: level, file }) {
        try {
            const { bucket, region, key } = file;
            const [, , keyWithoutPrefix] = /([^/]+\/){2}(.*)$/.exec(key) || key;

            const url = await Storage.get(keyWithoutPrefix, { bucket, region, level });

            window.open(url);
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        return (
            <React.Fragment>
                <Table celled={true}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell><Icon name={'key'} /> PhotoId</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'info'} />Friendly name</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'eye'} />Visibility</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'user'} />Owner</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'calendar'} />Created at</Table.HeaderCell>
                            <Table.HeaderCell> <Icon name={'download'} />Download</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.props.photos && this.props.photos.items && [].concat(this.props.photos.items).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(photo => (
                            <Table.Row key={photo.id}>
                                <Table.Cell>{photo.file && photo.id}</Table.Cell>
                                <Table.Cell>{photo.name}</Table.Cell>
                                <Table.Cell>{photo.visibility}</Table.Cell>
                                <Table.Cell>{photo.owner}</Table.Cell>
                                <Table.Cell>{photo.file && photo.createdAt}</Table.Cell>
                                <Table.Cell>
                                    {photo.file? <Button icon labelPosition="right" onClick={this.handleDownload.bind(this, photo)}><Icon name="download" />Download</Button> : <Loader inline='centered' active size="tiny" />}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </React.Fragment>
        );
    }

}

export default graphql(
    QueryListPictures,
    {
        options: {
            fetchPolicy: 'cache-and-network',
        },
        props: ({ data: { listPictures: photos } }) => ({
            photos,
        })
    }
)(AllPhotos);
