'use client';

import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaProps {
  onChange: (token: string | null) => void;
}

const Recaptcha = ({ onChange }: RecaptchaProps) => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn("ReCAPTCHA site key not found in environment variables.");
    return null;
  }

  return (
    <div className="my-4">
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={onChange}
      />
    </div>
  );
};

export default Recaptcha;
