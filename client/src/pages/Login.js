import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input, Row, Col } from "reactstrap";
import Web3 from "web3";
import MayorMultipleCandidates from "../contracts/MayorMultipleCandidates.json";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: "",
      accounts: [],
      account_type: "",
    };
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  async componentDidMount() {
    if (localStorage.getItem("ethtoken")) {
      window.location.href = "/home";
    } else {
      const web3 = new Web3("http://localhost:8545");
      const accounts = await web3.eth.getAccounts();
      this.setState({ accounts });
    }
  }

  onContinue = (e) => {
    e.preventDefault();
    const { account, accounts, account_type } = this.state;
    if (account) {
      if (account_type) {
        if (accounts.includes(account)) {
          localStorage.setItem("eth_token", account);
          localStorage.setItem("eth_account_type", account_type);
          window.location.href = "/home";
        } else {
          window.alert("Unable to find this account...");
        }
      } else {
        window.alert("Select Account Type...");
      }
    } else {
      window.alert("Enter Your Eth Account...");
    }
  };

  render() {
    return (
      <div className="container mx-auto mt-4">
        <Row>
          <Col md="4" className="mx-auto">
            <Form>
              <FormGroup>
                <Label for="account">Eth Account</Label>
                <Input
                  type="text"
                  name="account"
                  id="account"
                  onChange={this.onChange}
                  value={this.state.account}
                  placeholder="Enter your ether account"
                />
              </FormGroup>
              <FormGroup>
                <Label for="account_type">Account Type</Label>
                <Input
                  type="select"
                  name="account_type"
                  id="account_type"
                  onChange={this.onChange}
                  value={this.state.account_type}
                >
                  <option value="">Select Account Type</option>
                  <option value="candidate">Candidate</option>
                  <option value="voter">Voter</option>
                </Input>
              </FormGroup>
              <Button
                type="submit"
                className="mt-2"
                color="success"
                onClick={this.onContinue}
              >
                Continue {">"}
              </Button>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}
