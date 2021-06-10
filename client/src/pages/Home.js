import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import Topbar from "../componenets/topbar";

const loading = () => (
  <div className="animated fadeIn pt-3 text-center">Loading...</div>
);

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: "",
    };
  }

  componentDidMount() {
    if (localStorage.getItem("eth_token")) {
      this.setState({ account: localStorage.getItem("eth_token") });
    } else {
      window.location.href = "/login";
    }
  }

  render() {
    const { account } = this.state;
    return (
      <div className="container mx-auto mt-4">
        {account ? <Topbar account={account} /> : loading}
      </div>
    );
  }
}
