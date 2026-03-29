"use client";

import React from 'react';
import styled from 'styled-components';

export const AnimatedTooltip = ({ message, children }: { message: string, children?: React.ReactNode }) => {
    return (
        <StyledWrapper>
            <div className="tooltip-container">
                <div className="icon">
                    {children ? children : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={30} height={30} fill="currentColor" className="text-slate-400">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.518 0-10-4.482-10-10s4.482-10 10-10 10 4.482 10 10-4.482 10-10 10zm-1-16h2v6h-2zm0 8h2v2h-2z" />
                        </svg>
                    )}
                </div>
                <div className="tooltip">
                    <p>{message}</p>
                </div>
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  /* Tooltip container */
  .tooltip-container {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  /* Icon styling */
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.3s ease, filter 0.3s ease;
  }

  /* SVG Animation: Rotate and scale effect */
  .icon svg {
    transition: transform 0.5s ease-in-out;
  }

  .icon:hover svg {
    transform: rotate(360deg) scale(1.2);
    color: #a855f7; /* brand purple hit */
  }

  /* Tooltip styling */
  .tooltip {
    visibility: hidden;
    width: max-content;
    max-width: 250px;
    background-color: #1e293b; /* slate-800 */
    color: #fff;
    text-align: center;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 500;
    position: absolute;
    bottom: 125%; /* Position above the icon */
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 50;
  }

  /* Tooltip Arrow */
  .tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #1e293b transparent transparent transparent;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }

  .tooltip-container:hover .tooltip {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    animation: bounce 0.6s ease;
  }
`;
