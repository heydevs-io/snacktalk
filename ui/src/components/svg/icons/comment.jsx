import React from 'react';

export default function CommentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{
        '--button-icon-size': '16px',
      }}
    >
      <path
        d="M10.6668 1.33331H5.3335C2.66683 1.33331 1.3335 2.66665 1.3335 5.33331V14C1.3335 14.3666 1.6335 14.6666 2.00016 14.6666H10.6668C13.3335 14.6666 14.6668 13.3333 14.6668 10.6666V5.33331C14.6668 2.66665 13.3335 1.33331 10.6668 1.33331Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.4"
        d="M4.6665 6.33331H11.3332"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.4"
        d="M4.6665 9.66669H9.33317"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
