import React, { Component } from "react";
import { Alert, Row, Col } from "reactstrap";

export default class Topbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: "",
    };
  }

  componentDidMount() {
    this.setState({ account: this.props.account });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ account: nextProps.account });
  }

  Logout = () => {
    localStorage.removeItem("ethtoken");
    window.location.href = "/login";
  };

  render() {
    return (
      <div>
        <Row>
          <Col md="12">
            <Alert color="success">
              Logged in using account: <strong>{this.state.account}</strong>
              <span
                onClick={this.Logout}
                style={{
                  float: "right",
                  color: "black",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Logout
              </span>
            </Alert>
          </Col>
        </Row>
      </div>
    );
  }
}
