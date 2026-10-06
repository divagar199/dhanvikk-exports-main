import React from 'react';
import SEO from '../../components/common/SEO';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginPage from '../../components/auth/LoginPage';
import AuthBrandPanel from '../../components/auth/AuthBrandPanel';

export default function Login() {
  return (
    <>
      <SEO
        title="Sign In | Dhanvikk Blooms"
        description="Sign in to your Dhanvikk Blooms account to manage luxury floral orders, track cold-chain deliveries, and access your botanical wishlist."
        canonical="/login"
        noindex={true}
      />

      <AuthLayout brandPanel={<AuthBrandPanel />}>
        <LoginPage />
      </AuthLayout>
    </>
  );
}
