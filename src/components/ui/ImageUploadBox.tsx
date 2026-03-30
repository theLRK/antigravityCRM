"use client";

import React from 'react';
import styled from 'styled-components';

export const ImageUploadBox = ({ onChange, selectedFileUrl }: { onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, selectedFileUrl?: string | null }) => {
  return (
    <StyledWrapper>
      <div className="container relative overflow-hidden group">
        {selectedFileUrl ? (
          <img src={selectedFileUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0 z-0" />
        ) : null}

        <div className={`relative z-10 w-full h-full flex flex-col ${selectedFileUrl ? 'bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
          <div className="header">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth={0} /><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" /><g id="SVGRepo_iconCarrier"> <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </g></svg>
            <p className={selectedFileUrl ? 'text-white' : ''}>{selectedFileUrl ? 'Click to change image' : 'Browse File to upload!'}</p>
          </div>
          <label htmlFor="file" className="footer w-full h-full absolute inset-0 cursor-pointer">
            {!selectedFileUrl && (
              <div className="absolute bottom-4 flex items-center justify-center w-full gap-2 text-[#853953]">
                <svg fill="#3b82f6" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><g id="SVGRepo_bgCarrier" strokeWidth={0} /><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" /><g id="SVGRepo_iconCarrier"><path d="M15.331 6H8.5v20h15V14.154h-8.169z" /><path d="M18.153 6h-.009v5.342H23.5v-.002z" /></g></svg>
                <p className="text-slate-600 m-0">No file selected</p>
              </div>
            )}
          </label>
          <input id="file" type="file" onChange={onChange} multiple accept="image/*" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  
  .container {
    width: 100%;
    height: 200px;
    border-radius: 16px;
    background-color: #f8fafc; /* match previous slate-50 */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.05);
    border: 2px dashed #9ca3af;
  }

  .header {
    width: 100%;
    height: 60%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 2px solid transparent;
    align-items: center;
    pointer-events: none;
  }

  .header svg {
    height: 40px;
    stroke: #94a3b8;
  }

  .header p {
    font-size: 15px;
    margin-top: 10px;
    font-weight: 500;
    color: #64748b;
  }

  #file {
    display: none;
  }`;
