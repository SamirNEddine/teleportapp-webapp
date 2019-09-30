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

export const GET_RECOMMENDED_CONTACTS = gql`
    query{
        recommendedContacts{
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

export const GET_VOXEET_TOKEN = gql`
    query{
        userVoxeetAccessToken{
            accessToken,
            refreshToken
        }
    }
`;

export const REFRESH_VOXEET_TOKEN = gql`
    query($refreshToken: String!){
        refreshUserVoxeetAccessToken(refreshToken: $refreshToken)
    }
`;

export const INVALIDATE_VOXEET_TOKEN = gql`
    query($accessToken: String!){
        invalidateUserVoxeetAccessToken(accessToken: $accessToken)
    }
`;