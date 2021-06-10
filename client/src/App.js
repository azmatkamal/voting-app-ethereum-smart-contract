import React, { Component, Suspense } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";

const loading = () => (
  <div className="animated fadeIn pt-3 text-center">Loading...</div>
);

export default class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <Suspense fallback={loading()}>
            <Switch>
              <Route
                exact
                path="/home"
                name="Home Page"
                render={(props) => <Home {...props} />}
              />
              <Route
                exact
                path="/login"
                name="Login Page"
                render={(props) => <Login {...props} />}
              />
              <Redirect to={"/login"} />
            </Switch>
          </Suspense>
        </BrowserRouter>
      </div>
    );
  }
}
