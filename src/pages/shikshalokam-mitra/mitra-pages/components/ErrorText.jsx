import React from "react";

const ErrorText = ({ errorText }) => {
  return (
    <div className="secondpage-error-div">
      <p className="secondpage-error-text">{errorText}</p>
    </div>
  );
};

export default ErrorText;
