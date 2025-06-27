import React, { useState } from 'react';
import { Box, Paper, Grid, InputBase, IconButton, Badge, Typography } from '@mui/material';
import { Announcement, Quiz, Search, Notifications, Mail } from '@mui/icons-material';
import ListCard from '../components/ListCard';
import '../styles/Dashboard.css';
import PageHeader from '../components/layout/PageHeader';

const dummyAnnouncements = [
  {
    id: 1,
    title: 'Exam Schedule Released',
    author: 'Prof. Smith',
    date: '2024-06-01',
    content: 'The final exam schedule is now available. Please check the portal for your exam dates.'
  },
  {
    id: 2,
    title: 'Assignment Deadline Extended',
    author: 'Dr. Lee',
    date: '2024-05-28',
    content: 'The deadline for Assignment 3 has been extended by one week.'
  }
];

const dummyQuizzes = [
  {
    id: 1,
    title: 'Unit 2 Quiz',
    course: 'Physics 101',
    due: '2024-06-05',
    status: 'Not Started'
  },
  {
    id: 2,
    title: 'Math Midterm',
    course: 'Math 201',
    due: '2024-06-10',
    status: 'In Progress'
  }
];

const Dashboard = () => {
  const [search, setSearch] = useState('');
  // Example counts for messages/notifications
  const [msgCount] = useState(3);
  const [notifCount] = useState(5);

  return (
    <Box sx={{ p: 3 }}>
      {/* Modern Dashboard Header */}
      <PageHeader
        title="Dashboard"
        searchValue={search}
        onSearch={setSearch}
        msgCount={msgCount}
        notifCount={notifCount}
      />

      {/* Banner / Tips Section */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(90deg, #1f2937 0%, #374151 100%)', color: '#fff', borderRadius: 3, boxShadow: 2 }}>
        <span role="img" aria-label="tip" style={{ fontSize: 28, marginRight: 8 }}>💡</span>
        <span style={{ fontWeight: 700, fontSize: 24 }}>Study Tip</span>
        <div style={{ margin: '12px 0 18px 0', fontSize: 18 }}>
          "Consistency is the key to success. Set aside time each day to review your notes and practice problems!"
        </div>
        <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
          VIEW MORE TIPS
        </button>
      </Paper>

      <div className="dashboard-sections">
        <div className="dashboard-section-card">
          <ListCard
            title="Announcements"
            icon={<Announcement />}
            items={dummyAnnouncements}
            viewAllLabel="VIEW ALL ANNOUNCEMENTS"
            viewAllHref="/announcements"
            renderItem={a => (
              <Box key={a.id} mb={2}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{a.title}</div>
                <div style={{ color: '#555', fontSize: 14 }}>{a.content}</div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>By {a.author} • {a.date}</div>
                <Box sx={{ borderBottom: '1px solid #e5e7eb', my: 1 }} />
              </Box>
            )}
          />
        </div>
        <div className="dashboard-section-card">
          <ListCard
            title="Quizzes"
            icon={<Quiz />}
            items={dummyQuizzes}
            viewAllLabel="VIEW ALL QUIZZES"
            viewAllHref="/quizzes"
            renderItem={q => (
              <Box key={q.id} mb={2}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{q.title}</div>
                <div style={{ color: '#555', fontSize: 14 }}>{q.course} • Due: {q.due}</div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>Status: {q.status}</div>
                <Box sx={{ borderBottom: '1px solid #e5e7eb', my: 1 }} />
              </Box>
            )}
          />
        </div>
      </div>
    </Box>
  );
};

export default Dashboard; 