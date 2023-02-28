import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

export type LogoutProps = {
}

const Logout: React.FC<LogoutProps> = (props) => {
    const navigate = useNavigate();
    const [cookie, setCookie, removeCookie] = useCookies();

    const handleSubmit = (e: React.SyntheticEvent) => {
        // Jwt is stateless so we only have to remove the cookies
        removeCookie('jwt', {path:'/'});
        removeCookie('user', {path:'/'});
        removeCookie('id', {path:'/'});

        navigate("/");
    }


    return (
        <Form onSubmit={handleSubmit}>
            <Button type="submit">Logout</Button>
        </Form>
    )
}

export default Logout;