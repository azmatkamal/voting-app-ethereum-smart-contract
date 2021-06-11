import React, { Component } from "react";
import {
  Row,
  Col,
  Table,
  Card,
  CardText,
  CardBody,
  CardTitle,
  CardSubtitle,
  Button,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import Topbar from "../componenets/topbar";
import instance from "../MayorContract";

const loading = () => (
  <div className="animated fadeIn pt-3 text-center">Loading...</div>
);

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: "",
      candidates: [],
      account_type: "",
      voting_amount: 0,
      sigil: 0,
      envelope_opened: "no",
      winner: "",
      winner_type: false,
    };
  }

  async componentDidMount() {
    this.setState({
      account_type: localStorage.getItem("eth_account_type"),
      envelope_opened: localStorage.getItem("eth_envelope_opened"),
      sigil: localStorage.getItem("eth_sigil"),
      voting_amount: localStorage.getItem("eth_voting_amount"),
      candidate_account: localStorage.getItem("eth_candidate_account"),
    });
    if (localStorage.getItem("eth_token")) {
      this.setState({ account: localStorage.getItem("eth_token") });
      const mayor = await instance.contract();

      const candidateCount = (await mayor.get_candidate_count()).toNumber();
      for (let i = 0; i < candidateCount; i++) {
        this.setState({
          candidates: [
            await mayor.get_candidate_using_idx(i),
            ...this.state.candidates,
          ],
        });
      }
    } else {
      window.location.href = "/login";
    }
  }

  openEnvelope = async () => {
    const { account, candidate_account, sigil, voting_amount } = this.state;
    const mayor = await instance.contract();
    try {
      const result = await mayor.open_envelope.sendTransaction(
        sigil,
        candidate_account,
        {
          from: account,
          value: voting_amount,
        }
      );
      if (result && result.tx) {
        localStorage.setItem("eth_envelope_opened", "yes");
        window.alert("Envelop opened...");
        window.location.reload();
      }
    } catch (error) {
      if (error && error.message && error.message.indexOf("Reason given:")) {
        window.alert(error.message.split("Reason given:")[1].trim());
      } else {
        window.alert("Unable to open an envelope...");
      }
    }
  };

  checkResult = async () => {
    // const { account, candidate_account, sigil, voting_amount } = this.state;
    const mayor = await instance.contract();
    try {
      const result = await mayor.mayor_or_sayonara({
        from: this.state.account,
      });
      console.log(result);
      if (result && result.tx) {
        const winner = await mayor.check_result();
        if (winner) {
          this.setState({ winner: winner[0], winner_type: winner[1] });
          window.alert("Result announced...");
        } else {
          window.alert("Unable to find the winner...");
        }

        // window.location.reload();
      }
    } catch (error) {
      console.log(error);
      if (error && error.message && error.message.indexOf("Reason given:")) {
        // window.alert(error.message.split("Reason given:")[1].trim());
      } else {
        window.alert("Unable to open an envelope...");
      }
    }
  };

  render() {
    const {
      account,
      candidates,
      account_type,
      candidate_account,
      envelope_opened,
      winner,
      winner_type,
    } = this.state;

    const CandidatesList = (
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th>#</th>
                <th>Candidate Accounts</th>
              </tr>
            </thead>
            <tbody>
              {candidates &&
                candidates.length &&
                candidates.map((item, idx) => (
                  <tr key={idx}>
                    <th scope="row">{idx + 1}</th>
                    <td>{item}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    );

    const voterDetails = (
      <div>
        <Card>
          <CardBody>
            <CardTitle tag="h5">
              Account Type: {account_type.toUpperCase()}
            </CardTitle>
            <CardSubtitle tag="h6" className="mb-2 text-muted">
              {account}
            </CardSubtitle>
            {account_type === "voter" && (
              <CardText>
                {"You voted for candidate: " + candidate_account}
              </CardText>
            )}
            {account_type !== "voter" && (
              <CardText>{"Your id: " + account}</CardText>
            )}
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardBody>
        </Card>
      </div>
    );

    const openEnvelope = (
      <div>
        <Card>
          <CardBody>
            <CardTitle tag="h5">Open Envelope</CardTitle>
            <CardSubtitle tag="h6" className="mb-2 text-muted">
              {account}
            </CardSubtitle>
            <CardText>
              <FormGroup>
                <Label for="sigil">SIGIL</Label>
                <Input
                  type="text"
                  name="sigil"
                  id="sigil"
                  onChange={this.onChange}
                  value={this.state.sigil}
                  placeholder="Enter your SIGIL"
                />
              </FormGroup>
              <FormGroup>
                <Label for="candidate_id">Candidate ID</Label>
                <Input
                  type="text"
                  name="candidate_id"
                  id="candidate_id"
                  onChange={this.onChange}
                  value={candidate_account}
                  readOnly
                  placeholder="Enter your Candidate ID"
                />
              </FormGroup>
            </CardText>
            {envelope_opened !== "yes" && (
              <Button onClick={this.openEnvelope}>Open Envelope</Button>
            )}
            {envelope_opened === "yes" && (
              <Button>Envelope already opened</Button>
            )}
          </CardBody>
        </Card>
      </div>
    );

    const resultsBox = (
      <div>
        <Card>
          <CardBody>
            <CardTitle tag="h5">Results</CardTitle>
            <CardSubtitle tag="h6" className="mb-2 text-muted">
              {winner === "" &&
                winner_type === false &&
                "Results not available yet..."}
              {winner !== "" && winner_type === false && <h4>Drawan</h4>}
              {winner !== "" && winner_type === true && <h4>{winner}</h4>}
            </CardSubtitle>
            <Button onClick={this.checkResult}>Check result</Button>
          </CardBody>
        </Card>
      </div>
    );

    return (
      <div className="container mx-auto mt-4">
        {account ? <Topbar account={account} /> : loading}
        <Row>
          <Col md="6">
            {candidates && candidates.length > 0 ? CandidatesList : loading}
            {account_type ? voterDetails : loading}
          </Col>
          {account_type === "voter" && <Col md="5">{openEnvelope}</Col>}
          <Col md="6">{resultsBox}</Col>
        </Row>
      </div>
    );
  }
}
