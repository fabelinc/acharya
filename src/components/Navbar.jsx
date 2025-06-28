import React from 'react';
import { Menu, Layout, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { key: '/', label: 'Home' },
    { key: '/teachers', label: 'Your Teaching Assistant' },
    // { key: '/students', label: 'For Students' },
    { key: '/about', label: 'About Us' },
  ];

  return (
    <Header style={{ backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          height: 64,
          justifyContent: 'space-between', // key change here
        }}
      >
        {/* Logo / Brand on the left */}
        <div style={{ flex: '0 0 auto' }}>
          <Text strong style={{ fontSize: 24, color: '#1677ff' }}>
            Aacharya
          </Text>
        </div>

        {/* Navigation Menu aligned right */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ borderBottom: 'none' }}
          items={navItems.map(({ key, label }) => ({
            key,
            label: <Link to={key}>{label}</Link>,
          }))}
        />
      </div>
    </Header>
  );
};

export default Navbar;
