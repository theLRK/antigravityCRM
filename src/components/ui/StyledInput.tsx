"use client";

import React from 'react';
import styled from 'styled-components';

export const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <StyledWrapper>
      <input autoComplete="off" className="input" {...props} />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  
  .input {
    border: none;
    outline: none;
    border-radius: 15px;
    padding: 1em;
    width: 100%;
    background-color: #e2e8f0; /* Match tailwind slate-200 closely */
    box-shadow: inset 2px 5px 10px rgba(0,0,0,0.1); /* lightened shadow for better fit */
    transition: 300ms ease-in-out;
    color: #0f172a; /* Slate 900 text */
  }

  .input:focus {
    background-color: white;
    transform: scale(1.02);
    box-shadow: 10px 10px 40px rgba(0,0,0,0.08),
               -10px -10px 40px #ffffff;
  }
  

`;
