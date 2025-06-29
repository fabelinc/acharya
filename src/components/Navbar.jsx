import React, { useState, useEffect } from 'react';
import { Menu, Layout, Typography, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navItems = [
    { key: '/', label: 'Home' },
    { key: '/teachers', label: 'Teaching Assistant Hub' }
    
  ];

  // Detect mobile width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // run on load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menu = (
    <Menu
      theme="dark"
      mode={isMobile ? 'vertical' : 'horizontal'}
      selectedKeys={[location.pathname]}
      onClick={() => isMobile && setVisible(false)}
      items={navItems.map(({ key, label }) => ({
        key,
        label: <Link to={key}>{label}</Link>,
      }))}
      style={{ borderBottom: 'none' }}
    />
  );

  return (
    <Header style={{ backgroundColor: '#1e1e1e', padding: '0 16px' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          height: 64,
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <Text strong style={{ fontSize: 24, color: '#fff' }}>
          Aacharya
        </Text>

        {/* Desktop Menu */}
        {!isMobile && menu}

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
              visible={visible}
              bodyStyle={{ padding: 0 }}
            >
              {menu}
            </Drawer>
          </>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
