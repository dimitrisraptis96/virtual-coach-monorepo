import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Label = styled.label`
  font-family: Rubik, sans-serif !important;

  font-size: 12px;
  color: #aaa;
  margin-left: 1rem;
  text-transform: capitalize;
`;
const Wrapper = styled.div`
  width: 100%;
`;

const StyledInput = styled.input`
  font-family: Rubik, sans-serif !important;

  background-color: #f5f5f5;
  box-sizing: border-box;
  border: 1px solid #f5f5f5;
  border-radius: 4px;
  padding: 12px 15px;
  margin: 4px 0 16px 0;
  width: 100%;
  outline: none;
  font-size: 1rem;
  ${"" /* transition: ___CSS_2___; */}

  &:focus {
    border: 1px solid #3e21de;
    transition: border 0.7s ease-in-out;
  }
`;

class Input extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    type: PropTypes.oneOf(["text", "email", "password", "number"]),
    required: PropTypes.bool,
    pattern: PropTypes.string,
    placeholder: PropTypes.string
  };

  static defaultProps = {
    type: "text",
    required: false,
    defaultValue: ""
  };

  render() {
    return (
      <Wrapper>
        {!this.props.isHidden && <Label>{this.props.label}:</Label>}
        <StyledInput
          id={this.props.id}
          type={this.props.type}
          name={this.props.name}
          defaultValue={this.props.defaultValue}
          onChange={event => this.props.onChange(event.target.value)}
          required={this.props.required}
          pattern={this.props.pattern}
          placeholder={this.props.placeholder}
          value={this.props.value}
        />
      </Wrapper>
    );
  }
}

export default Input;
