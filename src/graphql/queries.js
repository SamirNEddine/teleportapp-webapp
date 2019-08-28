import {gql} from "apollo-boost";

export const LOGIN_USER = gql`
    mutation($email: String!, $password: String!) {
        loginUser(email: $email, password:$password)
    }
`;

export const GET_USERS = gql`
    query{
        users{
            id
            firstName
            lastName
            email
            profilePicture
            company{
                id
            }
        }
    }
`;

export const GET_ME = gql`
    query{
        user{
            id
            firstName
            lastName
            profilePicture
            email
        }
    }
`;

export const GET_AGORA_TOKEN = gql`
    query($channel: String!){
        userAgoraToken(channel: $channel)
    }
`;