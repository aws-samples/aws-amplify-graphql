import gql from 'graphql-tag';

export default gql`
mutation ($name: String, $visibility: Visibility, $file: S3ObjectInput) {
  addPicture(
    name: $name
    visibility: $visibility
    file: $file
  ) {
    id
    name
    visibility
    owner
    createdAt
    file {
      region
      bucket
      key
    }
  }
}`;
