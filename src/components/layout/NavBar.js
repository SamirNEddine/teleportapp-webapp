import React, { useContext, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import {GET_ME} from "../../graphql/queries";

import './navBar.css';
import {AuthenticationContext} from "../../contexts/AuthenticationContext";
import {logout} from "../../actions/authenticationActions";

const NavBar = () => {
    const { authState, dispatch } = useContext(AuthenticationContext);
    const {data, refetch} = useQuery(GET_ME, {
        skip: !authState.user
    });

    const user = data ? data.user : null;
    useEffect(_ =>{
        if (authState.user){
            refetch();
        }
    },[authState, refetch]);

    const handleLogout = function () {
        dispatch(logout());
    };

    if (!authState.user){
        return <div/>
    }else{
        return (
            <nav className="mb-1 navbar navbar-expand navbar-dark secondary-color lighten-1">
                {/*<a className="navbar-brand" href="#">Navbar</a>*/}
                <div className="collapse navbar-collapse" id="navbarSupportedContent-555">
                    <ul className="navbar-nav ml-auto nav-flex-icons">
                        <li className="nav-item avatar dropdown">
                            <button className="nav-link dropdown-toggle btn bg-transparent" id="navbarDropdownMenuLink-55"
                               data-toggle="dropdown"
                               aria-haspopup="true" aria-expanded="false">
                                {(user && user.profilePicture )? <img src={user.profilePicture} className="rounded-circle z-depth-0"
                                                                    alt="avatar" /> : <div/>}
                            </button>
                            <div className="dropdown-menu   dropdown-secondary"
                                 aria-labelledby="navbarDropdownMenuLink-55">
                                <div className="dropdown-item" onClick={handleLogout}>Logout</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }

};

export default NavBar;