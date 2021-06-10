import React, { Component } from "react";

export default class Registeruser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: "",
      account_type: "",
    };
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <Row className="mt-4">
        <Col md="12">
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
    );
  }
}
