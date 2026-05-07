import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function useWelcomeModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const pending = localStorage.getItem('mello:welcome-pending');
    if (pending) {
      setOpen(true);
      localStorage.removeItem('mello:welcome-pending');
    }
  }, []);

  const onVerify = () => {
    setOpen(false);
    navigate('/therapist-verifications');
  };

  const onClose = () => {
    setOpen(false);
  };

  return { open, onClose, onVerify };
}
