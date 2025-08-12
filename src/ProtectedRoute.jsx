import { useNavigation } from './NavigationContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, routeName }) {
  const { allowedRoutes } = useNavigation();

  if (!allowedRoutes.includes(routeName)) {
    return <Navigate to="/" replace />;
  }

  return children;
}