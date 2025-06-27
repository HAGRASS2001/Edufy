import React from 'react';
import { Card, CardContent, Box, Typography, Avatar, Button } from '@mui/material';

export type ListCardProps<T> = {
  title: string;
  icon: React.ReactNode;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  viewAllLabel?: string;
  viewAllHref?: string;
};

function ListCard<T>({ title, icon, items, renderItem, viewAllLabel, viewAllHref }: ListCardProps<T>) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: '#2563eb', mr: 1 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" fontWeight={700}>{title}</Typography>
        </Box>
        {items.map(renderItem)}
        {viewAllLabel && viewAllHref && (
          <Button size="small" variant="text" sx={{ color: '#2563eb', fontWeight: 600 }} href={viewAllHref}>
            {viewAllLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default ListCard; 