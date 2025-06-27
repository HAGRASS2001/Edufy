import React from 'react';
import { Box, Typography, Paper, InputBase, IconButton, Badge } from '@mui/material';
import { Search, Notifications, Mail } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  searchValue: string;
  onSearch: (value: string) => void;
  msgCount?: number;
  notifCount?: number;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  searchValue,
  onSearch,
  msgCount = 0,
  notifCount = 0,
}) => (
  <Box
    sx={{
      mb: 4,
      borderRadius: 5,
      overflow: 'hidden',
      boxShadow: '0 8px 32px 0 rgba(31, 41, 55, 0.10)',
      background: '#fff',
      p: { xs: 2, md: 4 },
      display: 'flex',
      alignItems: 'center',
      flexDirection: { xs: 'column', md: 'row' },
      gap: 2,
      justifyContent: 'space-between',
    }}
  >
    <Typography
      variant="h3"
      sx={{
        fontWeight: 900,
        color: '#111',
        letterSpacing: '-1px',
        fontSize: { xs: 28, md: 40 },
        lineHeight: 1.1,
        textShadow: '0 2px 16px rgba(16,185,129,0.08)',
        mb: { xs: 2, md: 0 },
      }}
    >
      {title}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
      <Paper
        component="form"
        sx={{ display: 'flex', alignItems: 'center', borderRadius: 999, pl: 2, pr: 1, boxShadow: 0, background: 'rgba(243,244,246,0.7)', minWidth: 220 }}
        onSubmit={e => { e.preventDefault(); }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, color: '#111' }}
          placeholder="Search..."
          value={searchValue}
          onChange={e => onSearch(e.target.value)}
          inputProps={{ 'aria-label': 'search dashboard' }}
        />
        <IconButton type="submit" sx={{ p: 1, color: '#10b981' }} aria-label="search">
          <Search />
        </IconButton>
      </Paper>
      <IconButton sx={{ color: '#10b981' }} aria-label="messages">
        <Badge badgeContent={msgCount} color="error">
          <Mail />
        </Badge>
      </IconButton>
      <IconButton sx={{ color: '#10b981' }} aria-label="notifications">
        <Badge badgeContent={notifCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
    </Box>
  </Box>
);

export default PageHeader; 