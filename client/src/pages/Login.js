import React, { Component } from "react";
import { Button, Form, FormGroup, Label, Input, Row, Col } from "reactstrap";
import instance from "../MayorContract";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: "",
      accounts: [],
      account_type: "",
      candidate_account: "",
      voting_amount: 100000000000000,
      sigil: 0,
    };
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  async componentDidMount() {
    if (localStorage.getItem("eth_token")) {
      window.location.href = "/home";
    } else {
      const accounts = await instance.accounts();
      this.setState({ accounts });
    }
  }

  checkAndAddUser = async () => {
    const { account, account_type, candidate_account, voting_amount, sigil } =
      this.state;
    const mayor = await instance.contract();
    if (account_type === "candidate") {
      const result = await mayor.add_candidate.sendTransaction(account, {
        from: account,
        value: "100000000000000",
      });
      const candidateCount = (await mayor.get_candidate_count()).toNumber();
      if (candidateCount > 0 && result) {
        localStorage.setItem("eth_token", account);
        localStorage.setItem("eth_account_type", account_type);
        window.location.href = "/home";
      }
    } else {
      // asdas s
      const candidateCount = (await mayor.get_candidate_count()).toNumber();
      let c = [];
      for (let i = 0; i < candidateCount; i++) {
        c.push(await mayor.get_candidate_using_idx(i));
      }
      console.log(c, candidate_account, c.includes(candidate_account));
      if (candidate_account && c.includes(candidate_account)) {
        const envelope = await mayor.compute_envelope(
          sigil,
          candidate_account,
          voting_amount
        );
        let casted = await mayor.cast_envelope.sendTransaction(envelope, {
          from: account,
        });
        if (casted.tx) {
          localStorage.setItem("eth_token", account);
          localStorage.setItem("eth_account_type", account_type);
          localStorage.setItem("eth_sigil", sigil);
          localStorage.setItem("eth_voting_amount", voting_amount);
          localStorage.setItem("eth_candidate_account", candidate_account);
          window.location.href = "/home";
        }
      } else {
        window.alert("Invalid candidate account.");
      }
    }
  };

  onContinue = async (e) => {
    e.preventDefault();
    const { account, accounts, account_type } = this.state;
    if (account) {
      if (account_type) {
        if (accounts.includes(account)) {
          await this.checkAndAddUser();
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
              {this.state.account_type === "voter" && (
                <FormGroup>
                  <Label for="candidate_account">Candidate Account</Label>
                  <Input
                    type="text"
                    name="candidate_account"
                    id="candidate_account"
                    onChange={this.onChange}
                    value={this.state.candidate_account}
                    placeholder="Enter your candidate account whome you want to vote"
                  />
                </FormGroup>
              )}
              {this.state.account_type === "voter" && (
                <FormGroup>
                  <Label for="voting_amount">Voting Amount</Label>
                  <Input
                    type="text"
                    name="voting_amount"
                    id="voting_amount"
                    onChange={this.onChange}
                    value={this.state.voting_amount}
                    placeholder="Enter your voting amount"
                  />
                </FormGroup>
              )}
              {this.state.account_type === "voter" && (
                <FormGroup>
                  <Label for="sigil">SIGIL</Label>
                  <Input
                    type="number"
                    name="sigil"
                    id="sigil"
                    onChange={this.onChange}
                    value={this.state.sigil}
                    placeholder="Enter the SIGIL"
                  />
                </FormGroup>
              )}
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
