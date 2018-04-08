import gql from 'graphql-tag';

export default gql`
query {
  listPictures{
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
