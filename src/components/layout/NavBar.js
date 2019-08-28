import React from 'react';

import './navBar.css';

const NavBar = () => {
    return (
        <nav className="mb-1 navbar navbar-expand-lg navbar-dark secondary-color lighten-1 ">
            {/*<a class="navbar-brand" href="#">Teleport</a>*/}
            <div className="collapse navbar-collapse" id="navbarSupportedContent-555">
                <ul className="navbar-nav ml-auto nav-flex-icons">
                    <li className="nav-item avatar dropdown">
                        <a className="nav-link dropdown-toggle" id="navbarDropdownMenuLink-55" data-toggle="dropdown"
                           aria-haspopup="true" aria-expanded="false">
                            <img src="https://mdbootstrap.com/img/Photos/Avatars/avatar-2.jpg" className="rounded-circle z-depth-0"
                                 alt="avatar image" />
                        </a>
                        <div className="dropdown-menu dropdown-menu-lg-right dropdown-secondary"
                             aria-labelledby="navbarDropdownMenuLink-55">
                            <div className="dropdown-item" href="#">Logout</div>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;