import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          gap: '1rem',
          margin: 0,
          padding: 0,
        }}
      >
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              style={{
                textDecoration:
                  location.pathname === item.path ? 'underline' : 'none',
                color: location.pathname === item.path ? '#007bff' : '#333',
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
