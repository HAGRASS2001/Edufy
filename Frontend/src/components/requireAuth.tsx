import React from 'react';
import { isAuthenticated } from '../services/api';
import { useNavigate } from 'react-router-dom';

const requireAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const ComponentWithAuth: React.FC<P> = (props) => {
    const navigate = useNavigate();
    React.useEffect(() => {
      if (!isAuthenticated()) {
        navigate('/login', { replace: true });
      }
    }, [navigate]);
    return isAuthenticated() ? <WrappedComponent {...props} /> : null;
  };
  return ComponentWithAuth;
};

export default requireAuth; 