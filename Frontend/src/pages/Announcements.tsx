import React, { useState } from 'react';
import { Box, Typography, Paper, Pagination, Chip, Button, Dialog, DialogTitle, DialogContent, Slide, IconButton, Stack, Switch, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Autocomplete } from '@mui/material';
import { Announcement, Close, TableRows, ViewModule, Add } from '@mui/icons-material';
import ListCard from '../components/ListCard';
import { TransitionProps } from '@mui/material/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader';

// Dummy data matching the AnnouncementSchema
const dummyAnnouncements = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Announcement ${i + 1}`,
  content: `This is the content for announcement ${i + 1}. It might be very long, so it will be truncated in the card view. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  instructorName: `Instructor ${i % 3 + 1}`,
  course: `Course ${i % 2 + 1}`,
  priority: ['low', 'medium', 'high'][i % 3],
  type: ['general', 'assignment', 'exam', 'event', 'deadline'][i % 5],
  isActive: true,
  semester: `2023/2024 - S${(i % 2) + 1}`,
  attachments: [
    {
      fileName: `file${i + 1}.pdf`,
      fileUrl: `https://example.com/file${i + 1}.pdf`,
      fileType: 'pdf',
    },
  ],
  tags: ['important', 'update', i % 2 === 0 ? 'exam' : 'assignment'],
  publishDate: new Date(2024, 4, i + 1),
  expiryDate: new Date(2024, 5, i + 10),
}));

const CARDS_PER_ROW = 3;
const ROWS_PER_PAGE = 3;
const CARDS_PER_PAGE = CARDS_PER_ROW * ROWS_PER_PAGE;

const priorityColors: Record<string, string> = {
  low: '#60a5fa',
  medium: '#fbbf24',
  high: '#ef4444',
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Announcements = () => {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<typeof dummyAnnouncements[0] | null>(null);
  const [tableView, setTableView] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Extract unique values for filters
  const courseOptions = Array.from(new Set(dummyAnnouncements.map(a => a.course)));
  const semesterOptions = Array.from(new Set(dummyAnnouncements.map(a => a.semester)));

  // Filtering logic
  const filteredAnnouncements = dummyAnnouncements.filter(a => {
    return (
      (!priorityFilter || a.priority === priorityFilter) &&
      (!typeFilter || a.type === typeFilter) &&
      (!courseFilter || a.course === courseFilter) &&
      (!semesterFilter || a.semester === semesterFilter) &&
      (
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase())
      )
    );
  });

  const pageCount = Math.ceil(filteredAnnouncements.length / CARDS_PER_PAGE);
  const pagedAnnouncements = filteredAnnouncements.slice(
    (page - 1) * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE
  );

  const handleShow = (announcement: typeof dummyAnnouncements[0]) => {
    setSelected(announcement);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Announcements"
        searchValue={search}
        onSearch={setSearch}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddOpen(true)}
          sx={{
            background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
            color: '#fff',
            borderRadius: 999,
            fontWeight: 700,
            px: 3,
            py: 1.2,
            boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)',
            textTransform: 'none',
            transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
            '&:hover': {
              background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)',
              boxShadow: '0 4px 16px 0 rgba(37,99,235,0.15)',
              transform: 'translateY(-2px) scale(1.04)',
            },
          }}
        >
          Add Announcement
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={tableView}
              onChange={() => setTableView(v => !v)}
              color="primary"
            />
          }
          label={tableView ? <><TableRows sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Table View</> : <><ViewModule sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Card View</>}
          labelPlacement="start"
        />
      </Box>
      {/* Filter Bar */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: 1, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Autocomplete
          options={['low', 'medium', 'high']}
          value={priorityFilter}
          onChange={(_, v) => setPriorityFilter(v)}
          renderInput={params => <TextField {...params} label="Priority" size="small" />}
          sx={{ minWidth: 140 }}
          clearOnEscape
        />
        <Autocomplete
          options={['general', 'assignment', 'exam', 'event', 'deadline']}
          value={typeFilter}
          onChange={(_, v) => setTypeFilter(v)}
          renderInput={params => <TextField {...params} label="Type" size="small" />}
          sx={{ minWidth: 140 }}
          clearOnEscape
        />
        <Autocomplete
          options={courseOptions}
          value={courseFilter}
          onChange={(_, v) => setCourseFilter(v)}
          renderInput={params => <TextField {...params} label="Course" size="small" />}
          sx={{ minWidth: 140 }}
          clearOnEscape
        />
        <Autocomplete
          options={semesterOptions}
          value={semesterFilter}
          onChange={(_, v) => setSemesterFilter(v)}
          renderInput={params => <TextField {...params} label="Semester" size="small" />}
          sx={{ minWidth: 140 }}
          clearOnEscape
        />
        <TextField
          label="Search"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setPriorityFilter(null);
            setTypeFilter(null);
            setCourseFilter(null);
            setSemesterFilter(null);
            setSearch('');
          }}
          sx={{ ml: 'auto', borderRadius: 999, fontWeight: 700 }}
        >
          Clear Filters
        </Button>
      </Paper>
      <AnimatePresence mode="wait">
        {!tableView ? (
          <motion.div
            key="card-view"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                justifyContent: 'flex-start',
              }}
            >
              {pagedAnnouncements.map(a => (
                <Box
                  key={a.id}
                  sx={{
                    flex: '1 1 100%',
                    maxWidth: '100%',
                    '@media (min-width:600px)': {
                      flex: '1 1 48%',
                      maxWidth: '48%',
                    },
                    '@media (min-width:900px)': {
                      flex: '1 1 32%',
                      maxWidth: '32%',
                    },
                  }}
                >
                  <ListCard
                    title={a.title}
                    icon={<Announcement />}
                    items={[a]}
                    renderItem={item => (
                      <Box>
                        <Typography variant="body2" sx={{ color: '#555', mb: 1 }}>
                          {item.content.length > 80 ? item.content.slice(0, 80) + '...' : item.content}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Chip label={item.priority} size="small" sx={{ bgcolor: priorityColors[item.priority], color: '#fff', fontWeight: 700, textTransform: 'capitalize' }} />
                          <Chip label={item.type} size="small" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            {item.course}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block">
                          By {item.instructorName} • {item.publishDate.toLocaleDateString()}
                        </Typography>
                        <Box mt={1} mb={1}>
                          {item.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                          ))}
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleShow(item)}
                          sx={{
                            background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
                            color: '#fff',
                            borderRadius: 999,
                            fontWeight: 700,
                            px: 3,
                            py: 1.2,
                            boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)',
                            textTransform: 'none',
                            transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)',
                              boxShadow: '0 4px 16px 0 rgba(37,99,235,0.15)',
                              transform: 'translateY(-2px) scale(1.04)',
                            },
                          }}
                        >
                          Show
                        </Button>
                      </Box>
                    )}
                  />
                </Box>
              ))}
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="table-view"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Instructor</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Published</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell>Show</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedAnnouncements.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>{a.title}</TableCell>
                      <TableCell>{a.instructorName}</TableCell>
                      <TableCell>{a.course}</TableCell>
                      <TableCell>
                        <Chip label={a.priority} size="small" sx={{ bgcolor: priorityColors[a.priority], color: '#fff', fontWeight: 700, textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={a.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{a.publishDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        {a.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleShow(a)}
                          sx={{
                            background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
                            color: '#fff',
                            borderRadius: 999,
                            fontWeight: 700,
                            px: 2,
                            py: 0.8,
                            boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)',
                            textTransform: 'none',
                            transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)',
                              boxShadow: '0 4px 16px 0 rgba(37,99,235,0.15)',
                              transform: 'translateY(-2px) scale(1.04)',
                            },
                          }}
                        >
                          Show
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        )}
      </AnimatePresence>
      {pageCount > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {selected?.title}
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>{selected.type.toUpperCase()} • {selected.priority.toUpperCase()}</Typography>
              <Typography variant="body1" mb={2}>{selected.content}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Instructor: {selected.instructorName}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Course: {selected.course}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Semester: {selected.semester}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Published: {selected.publishDate.toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Expires: {selected.expiryDate?.toLocaleDateString?.() || 'N/A'}
              </Typography>
              <Box mb={2}>
                {selected.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                ))}
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" fontWeight={600}>Attachments:</Typography>
                {selected.attachments.length > 0 ? (
                  selected.attachments.map(att => (
                    <Box key={att.fileUrl} display="flex" alignItems="center" mb={1}>
                      <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', marginRight: 8 }}>{att.fileName}</a>
                      <Chip label={att.fileType} size="small" />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No attachments</Typography>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active: {selected.isActive ? 'Yes' : 'No'}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add New Announcement
          <IconButton onClick={() => setAddOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={e => { e.preventDefault(); setAddOpen(false); }}>
            <Stack spacing={2}>
              <TextField label="Title" fullWidth required />
              <TextField label="Content" fullWidth required multiline minRows={3} />
              <TextField label="Instructor Name" fullWidth required />
              <TextField label="Course" fullWidth required />
              <TextField label="Semester" fullWidth required />
              <TextField label="Tags (comma separated)" fullWidth />
              <Stack direction="row" spacing={2}>
                <TextField label="Priority" select defaultValue="medium" fullWidth>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
                <TextField label="Type" select defaultValue="general" fullWidth>
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="assignment">Assignment</MenuItem>
                  <MenuItem value="exam">Exam</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                  <MenuItem value="deadline">Deadline</MenuItem>
                </TextField>
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label="Publish Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
                <TextField label="Expiry Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
              </Stack>
              <Button variant="outlined" component="label">
                Upload Attachments
                <input type="file" hidden multiple />
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
                  color: '#fff',
                  borderRadius: 999,
                  fontWeight: 700,
                  px: 3,
                  py: 1.2,
                  boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)',
                  textTransform: 'none',
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)',
                    boxShadow: '0 4px 16px 0 rgba(37,99,235,0.15)',
                    transform: 'translateY(-2px) scale(1.04)',
                  },
                }}
              >
                Submit
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Announcements; 