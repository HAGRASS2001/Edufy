import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, actions }) => (
  <Box
    sx={{
      mb: 4,
      borderRadius: 5,
      overflow: 'hidden',
      boxShadow: '0 8px 32px 0 rgba(16,185,129,0.10)',
      background: 'linear-gradient(90deg, #f0fdf4 0%, #d1fae5 100%)',
      position: 'relative',
      p: { xs: 3, md: 6 },
      display: 'flex',
      alignItems: 'center',
      flexDirection: { xs: 'column', md: 'row' },
      gap: 3,
      backdropFilter: 'blur(8px)',
      justifyContent: 'space-between',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
      {icon && (
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Box sx={{ fontSize: 56, color: '#10b981', mr: 2, display: 'flex', alignItems: 'center' }}>{icon}</Box>
        </Box>
      )}
      <Box>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            color: '#10b981',
            letterSpacing: '-1px',
            fontSize: { xs: 32, md: 48 },
            lineHeight: 1.1,
            mb: 1,
            textShadow: '0 2px 16px rgba(16,185,129,0.10)',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="h6"
            sx={{
              color: '#6366f1',
              fontWeight: 600,
              fontSize: { xs: 16, md: 20 },
              textShadow: '0 1px 8px rgba(99,102,241,0.10)',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {actions && <Box sx={{ ml: { md: 'auto' }, mt: { xs: 2, md: 0 }, display: 'flex', alignItems: 'center', gap: 2 }}>{actions}</Box>}
  </Box>
);

export default PageHeader; 