import React, { useState, useEffect } from 'react';
import { Box, Paper, Grid, InputBase, IconButton, Badge, Typography } from '@mui/material';
import { Announcement, Quiz, Search, Notifications, Mail } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ListCard from '../components/ListCard';
import '../styles/Dashboard.css';
import PageHeader from '../components/layout/PageHeader';
import { announcementService } from '../services/announcementService';
import { Announcement as AnnouncementType } from '../types/announcement';
import { quizService } from '../services/quizService';
import { Quiz as QuizType } from '../types/quiz';
import requireAuth from '../components/requireAuth';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25
    }
  }
};

const bannerVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      delay: 0.15
    }
  }
};

const sectionVariants = {
  hidden: { 
    opacity: 0, 
    x: -30
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: 0.25
    }
  }
};

const Dashboard = () => {
  const [search, setSearch] = useState('');

  const [msgCount] = useState(3);
  const [notifCount] = useState(5);
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoadingAnnouncements(true);
        const data = await announcementService.getAnnouncements();
        setAnnouncements(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (err) {
        setAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoadingQuizzes(true);
        const data = await quizService.getQuizzes();
        setQuizzes(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (err) {
        setQuizzes([]);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Dashboard Header */}
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Dashboard"
            searchValue={search}
            onSearch={setSearch}
            msgCount={msgCount}
            notifCount={notifCount}
          />
        </motion.div>

        {/* Banner / Tips Section */}
        <motion.div variants={bannerVariants}>
          <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, md: 4 }, background: 'linear-gradient(90deg, #1f2937 0%, #374151 100%)', color: '#fff', borderRadius: 3, boxShadow: 2 }}>
            <span role="img" aria-label="tip" style={{ fontSize: 28, marginRight: 8 }}>💡</span>
            <span style={{ fontWeight: 700, fontSize: 24 }}>Study Tip</span>
            <div style={{ margin: '12px 0 18px 0', fontSize: 18 }}>
              "Consistency is the key to success. Set aside time each day to review your notes and practice problems!"
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                background: '#ef4444', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '10px 24px', 
                fontWeight: 600, 
                fontSize: 16, 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              VIEW MORE TIPS
            </motion.button>
          </Paper>
        </motion.div>


        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 4 },
            mt: { xs: 1, md: 2 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <motion.div
              className="dashboard-section-card"
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <ListCard
                title="Announcements"
                icon={<Announcement />}
                items={announcements}
                viewAllLabel="VIEW ALL ANNOUNCEMENTS"
                viewAllHref="/announcements"
                renderItem={a => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Box mb={2}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{a.title}</div>
                      <div style={{ color: '#555', fontSize: 14 }}>{a.content.length > 80 ? a.content.slice(0, 80) + '...' : a.content}</div>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>By {a.instructorName} • {new Date(a.publishDate).toLocaleDateString()}</div>
                      <Box sx={{ borderBottom: '1px solid #e5e7eb', my: 1 }} />
                    </Box>
                  </motion.div>
                )}
              />
            </motion.div>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <motion.div
              className="dashboard-section-card"
              variants={itemVariants}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <ListCard
                title="Quizzes"
                icon={<Quiz />}
                items={quizzes}
                viewAllLabel="VIEW ALL QUIZZES"
                viewAllHref="/quizzes"
                renderItem={q => (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Box mb={2}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{q.title}</div>
                      <div style={{ color: '#555', fontSize: 14 }}>{q.course} • Due: {new Date(q.endDate).toLocaleDateString()}</div>
                      <Box sx={{ borderBottom: '1px solid #e5e7eb', my: 1 }} />
                    </Box>
                  </motion.div>
                )}
              />
            </motion.div>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default requireAuth(Dashboard); 