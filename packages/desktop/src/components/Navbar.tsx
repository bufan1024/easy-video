import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from 'antd'
import { HomeOutlined, SettingOutlined } from '@ant-design/icons'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  // 判断是否在首页
  const isHome = location.pathname === '/'
  // 判断是否在设置页
  const isSettings = location.pathname === '/settings'

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: 'var(--space-md) var(--space-lg)',
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo / Brand */}
        <div
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5'>
              <polygon points='5 3 19 12 5 21 5 3' />
            </svg>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-primary)',
            }}
          >
            Easy Video
          </span>
        </div>

        {/* Navigation Links */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-sm)',
          }}
        >
          <Button
            type={isHome ? 'primary' : 'text'}
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{
              color: isHome ? undefined : 'var(--text-secondary)',
            }}
          >
            首页
          </Button>
          <Button
            type={isSettings ? 'primary' : 'text'}
            icon={<SettingOutlined />}
            onClick={() => navigate('/settings')}
            style={{
              color: isSettings ? undefined : 'var(--text-secondary)',
            }}
          >
            设置
          </Button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
