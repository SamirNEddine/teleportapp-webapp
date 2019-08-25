import {gql} from "apollo-boost";

export const LOGIN_USER = gql`
    mutation($email: String!, $password: String!) {
        loginUser(email: $email, password:$password)
    }
`;