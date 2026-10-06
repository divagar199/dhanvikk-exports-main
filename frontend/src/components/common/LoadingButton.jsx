import React from 'react';
import Button from './Button';

export default function LoadingButton({ loadingText = 'Signing in...', ...props }) {
  return <Button loadingText={loadingText} {...props} />;
}
