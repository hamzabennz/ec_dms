import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PrivateRoute() {
    const auth = useSelector(state => state.auth.value);

    // If not authenticated, redirect to sign-in
    if (!auth) {
        return <Navigate to="/authentication/sign-in" />;
    }

    // Otherwise, render the protected component
    return <Outlet />;
}

export default PrivateRoute;