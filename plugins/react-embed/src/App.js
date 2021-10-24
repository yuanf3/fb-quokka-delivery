import React, { useEffect, useState } from "react";
import { HashRouter, Link, Redirect, Route, Switch } from "react-router-dom";
import FacebookLogin from "react-facebook-login";
import axios from "axios";
import {
  Button,
  Col,
  Container,
  Image,
  Navbar,
  Nav,
  Alert,
} from "react-bootstrap";
import Posts from "./components/Posts";
import Invites from "./components/Invites";

/**
 * component: The data migration app.
 *
 * props:
 * - propsFromPlugin (object): data passed in from the react-embed plugin
 *   - username (string): WordPress username
 *   - hash (string): WordPress password hash
 *
 * state:
 * - login (boolean): whether the user is currently logged in to Facebook
 * - loggedInUser (object): Facebook user details including id and access token
 * - JWT (string): a token retrieved from WordPress for accessing protected API routes
 */
function App({ propsFromPlugin }) {
  const [login, setLogin] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [JWT, setJWT] = useState("");

  // Initialise with a request for a JWT token from WordPress
  useEffect(() => {
    axios({
      method: "post",
      url: "/wp-json/jwt-auth/v1/token",
      data: {
        username: propsFromPlugin.username,
        password: propsFromPlugin.hash,
        custom_auth: true,
      },
    })
      .then((response) => setJWT(response.data.data.token))
      .catch(() => setJWT("No JWT, you're probably outside of WordPress"));
  }, [propsFromPlugin]);

  // Callback function for Facebook login. Gets user details, including the access token.
  const responseFacebook = (response) => {
    console.log(response);
    setLoggedInUser(response);
    if (response.accessToken) {
      setLogin(true);
    } else {
      setLogin(false);
    }
  };

  return (
    <HashRouter hashType="noslash">
      <Navbar bg="light" expand="md">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Quokka Migration Tool
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/posts">
                Migrate
              </Nav.Link>
              <Nav.Link as={Link} to="/requests">
                Requests
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              {!login && (
                <FacebookLogin
                  appId="1254247761671550"
                  autoLoad={false}
                  fields="name,email,picture"
                  callback={responseFacebook}
                />
              )}
              {login && (
                <>
                  <Image src={loggedInUser.picture.data.url} roundedCircle />{" "}
                  {loggedInUser.name}{" "}
                  <Button
                    onClick={() => window.location.reload(false)}
                    variant="primary"
                  >
                    Log Out of Facebook
                  </Button>
                </>
              )}
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="p-4">
        <Col xs={12} md={6}>
          <Switch>
            <Route exact path="/posts">
              <Posts login={login} loggedInUser={loggedInUser} JWT={JWT} />
            </Route>
            <Route exact path="/requests">
              <Invites su={propsFromPlugin.admin} JWT={JWT} />
            </Route>
            <Route>
              <Redirect to="/" />
              <Alert variant="info">
                <Alert.Heading>
                  Welcome to the Quokka Migration Tool!
                </Alert.Heading>
                <p>
                  You're here because you plan on migrating your posts from
                  Facebook to Quokka Network's amazing new platform.
                </p>
                <hr />
                <p>What you need to do:</p>
                <ol className="mb-0">
                  <li>
                    Login with Facebook. We will ask for a few permissions so we
                    can see the posts you want to move. Don't worry, we won't be
                    posting anything.
                  </li>
                  <li>
                    Browse your posts through the Migrate tab above. If you have
                    anything you want to move, just press the migrate button,
                    and a moderator will do the rest.
                  </li>
                  <li>We hope you enjoy Quokka Network!</li>
                </ol>
              </Alert>
            </Route>
          </Switch>
        </Col>
      </Container>
    </HashRouter>
  );
}

export default App;
