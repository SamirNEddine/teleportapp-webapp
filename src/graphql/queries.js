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
            status
            company{
                id
            }
        }
    }
`;

export const GET_USER = gql`
    query($id: Int!){
        user(id: $id){
            id
            firstName
            lastName
            profilePicture
            email
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

export const GET_OPENTOK_SESSION = gql`
    query{
        openTokSession
    }
`;

export const GET_OPENTOK_TOKEN = gql`
    query($sessionId: String!){
        userOpenTalkToken(sessionId: $sessionId)
    }
`;