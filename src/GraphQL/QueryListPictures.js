import gql from 'graphql-tag';

export default gql`
query {
  listPictures(limit: 100) {
    items {
      id
      name
      visibility
      owner
      createdAt
      file {
        bucket
        region
        key
      }
    }
  }
}`;
