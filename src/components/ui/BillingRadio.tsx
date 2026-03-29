"use client";

import React from 'react';
import styled from 'styled-components';

export const BillingRadio = ({ onChange }: { onChange?: (plan: string) => void }) => {
    return (
        <StyledWrapper>
            <div className="glass-radio-group">
                <input type="radio" name="plan" id="glass-silver" value="silver" defaultChecked onChange={() => onChange?.('silver')} />
                <label htmlFor="glass-silver">Silver</label>

                <input type="radio" name="plan" id="glass-gold" value="gold" onChange={() => onChange?.('gold')} />
                <label htmlFor="glass-gold">Gold</label>

                <input type="radio" name="plan" id="glass-platinum" value="platinum" onChange={() => onChange?.('platinum')} />
                <label htmlFor="glass-platinum">Platinum</label>

                <div className="glass-glider" />
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
  .glass-radio-group {
    --bg: rgba(0, 0, 0, 0.04);
    --text: #64748b; /* slate-500 */

    display: flex;
    position: relative;
    background: var(--bg);
    border-radius: 1rem;
    backdrop-filter: blur(12px);
    box-shadow:
      inset 1px 1px 4px rgba(255, 255, 255, 0.4),
      inset -1px -1px 6px rgba(0, 0, 0, 0.05),
      0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    width: fit-content;
  }

  /* Dark mode overrides */

  .glass-radio-group input {
    display: none;
  }

  .glass-radio-group label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 100px;
    font-size: 14px;
    padding: 1rem 1.6rem;
    cursor: pointer;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: var(--text);
    position: relative;
    z-index: 2;
    transition: color 0.3s ease-in-out;
  }

  .glass-radio-group label:hover {
    color: #0f172a; /* darker slate for hover in light mode */
  }

  .glass-radio-group input:checked + label {
    color: #fff;
    text-shadow: 0px 1px 2px rgba(0,0,0,0.3); /* better readability on gliders */
  }

  .glass-glider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: calc(100% / 3);
    border-radius: 1rem;
    z-index: 1;
    transition:
      transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
      background 0.4s ease-in-out,
      box-shadow 0.4s ease-in-out;
  }

  /* Silver */
  #glass-silver:checked ~ .glass-glider {
    transform: translateX(0%);
    background: linear-gradient(135deg, #c0c0c0, #e2e8f0);
    box-shadow:
      0 0 18px rgba(192, 192, 192, 0.3),
      0 0 10px rgba(255, 255, 255, 0.4) inset;
  }

  /* Gold */
  #glass-gold:checked ~ .glass-glider {
    transform: translateX(100%);
    background: linear-gradient(135deg, #ffd700, #fef08a);
    box-shadow:
      0 0 18px rgba(255, 215, 0, 0.4),
      0 0 10px rgba(255, 235, 150, 0.6) inset;
  }

  /* Platinum (Purple) - Rebranding to purple as requested */
  #glass-platinum:checked ~ .glass-glider {
    transform: translateX(200%);
    background: linear-gradient(135deg, #c084fc, #a855f7);
    box-shadow:
      0 0 18px rgba(168, 85, 247, 0.4),
      0 0 10px rgba(216, 180, 254, 0.6) inset;
  }
`;
