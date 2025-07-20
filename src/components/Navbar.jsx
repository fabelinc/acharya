import React, { useState, useEffect } from 'react';
import { Menu, Layout, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import logo from '../Images/AAcharya_logo.png';

const { Header } = Layout;

const Navbar = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navItems = [
    { key: '/', label: 'Home' },
    { key: '/teacher/login', label: 'Teacher Hub' },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderMenuItems = () =>
    navItems.map((item) => {
      const isActive = item.key === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith('/teacher');
  
      return (
        <Link
          key={item.key}
          to={item.key}
          onClick={() => setVisible(false)} // close drawer on mobile
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: isActive ? '2px solid white' : '2px solid transparent',
            color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
            fontWeight: isActive ? 'bold' : 'normal',
            transition: 'all 0.3s ease',
            display: 'block',
          }}
        >
          {item.label}
        </Link>
      );
    });

  return (
    <Header style={{ padding: 0, background: 'transparent', position: 'relative', zIndex: 10 }}>
      <div
        style={{
          background: 'linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            padding: '0 16px',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: '400%', justifyContent: 'flex-start' }}>
            <img
              src={logo}
              alt="Aacharya Logo"
              style={{
                
                height: '700px',
                objectFit: 'contain',
                background: 'transparent',
              }}
            />
          
          </Link>

          {/* Desktop Menu */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: 16 }}>{renderMenuItems()}</div>
          )}

          {/* Mobile Hamburger */}
          {isMobile && (
            <>
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
                onClick={() => setVisible(true)}
              />
              <Drawer
                title="Aacharya"
                placement="right"
                onClose={() => setVisible(false)}
                open={visible}
                styles={{
                  body: {
                    padding: 0, 
                    background: 'linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b', 
                    color: 'white' 
                  },
                  header:{
                    background: 'linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b', 
                    color: 'white' }
                  }}
              >
                {renderMenuItems()}
              </Drawer>
            </>
          )}
        </div>
      </div>
    </Header>
  );
};

export default Navbar;
