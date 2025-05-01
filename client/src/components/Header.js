import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
const Header = () => {
    return (_jsxs("header", { className: "app-header", children: [_jsx("h1", { className: "app-title", children: "Undefine" }), _jsxs("nav", { className: "header-nav", children: [_jsx(NavLink, { to: "/", className: ({ isActive }) => isActive ? "nav-link active" : "nav-link", end: true, children: "Game" }), _jsx(NavLink, { to: "/settings", className: ({ isActive }) => isActive ? "nav-link active" : "nav-link", children: "Settings" })] })] }));
};
export default Header;
