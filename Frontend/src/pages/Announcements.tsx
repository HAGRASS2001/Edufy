import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Pagination, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Slide, IconButton, Stack, Switch, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Autocomplete, CircularProgress, Alert, Snackbar } from '@mui/material';
import { Announcement, Close, TableRows, ViewModule, Add } from '@mui/icons-material';
import ListCard from '../components/ListCard';
import { TransitionProps } from '@mui/material/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/layout/PageHeader';
import CommonTable, { Column } from '../components/CommonTable';
import { announcementService } from '../services/announcementService';
import { Announcement as AnnouncementType, CreateAnnouncementRequest } from '../types/announcement';
import { useAppSelector } from '../store/store';

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

const announcementColumns: Column<AnnouncementType>[] = [
  { label: 'Title', field: 'title' },
  { label: 'Instructor', field: 'instructorName' },
  { label: 'Course', field: 'course' },
  { label: 'Priority', field: 'priority', renderCell: a => <Chip label={a.priority} size="small" sx={{ bgcolor: priorityColors[a.priority], color: '#fff', fontWeight: 700, textTransform: 'capitalize' }} /> },
  { label: 'Type', field: 'type', renderCell: a => <Chip label={a.type} size="small" variant="outlined" /> },
  { label: 'Published', field: 'publishDate', renderCell: a => new Date(a.publishDate).toLocaleDateString() },
  { label: 'Tags', field: 'tags', renderCell: a => a.tags.map(tag => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />) },
];

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AnnouncementType | null>(null);
  const [tableView, setTableView] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<AnnouncementType | null>(null);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<AnnouncementType | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const reduxUser = useAppSelector(state => state.auth.user);
  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      user = {};
    }
  }
  const userRole = user?.role;

  // Extract unique values for filters
  const courseOptions = Array.from(new Set(announcements.map(a => a.course)));
  const semesterOptions = Array.from(new Set(announcements.map(a => a.semester)));

  // Fetch announcements from API
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        priority: priorityFilter || undefined,
        type: typeFilter || undefined,
        course: courseFilter || undefined,
        semester: semesterFilter || undefined,
        search: search || undefined,
      };
      const data = await announcementService.getAnnouncements(filters);
      setAnnouncements(data);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch announcements on component mount and when filters change
  useEffect(() => {
    fetchAnnouncements();
  }, [priorityFilter, typeFilter, courseFilter, semesterFilter, search]);

  // Filtering logic (client-side for pagination)
  const filteredAnnouncements = announcements.filter(a => {
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

  const handleShow = (announcement: AnnouncementType) => {
    setSelected(announcement);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleRequestDelete = (announcement: AnnouncementType) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await announcementService.deleteAnnouncement(id);
      if (selected?._id === id) {
        handleClose();
      }
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
      setDeleteSuccess(true);
      fetchAnnouncements(); // Refresh the list
    } catch (err) {
      setError('Failed to delete announcement');
      console.error('Error deleting announcement:', err);
    }
  };

  const handleCreateAnnouncement = async (formData: CreateAnnouncementRequest) => {
    try {
      await announcementService.createAnnouncement(formData);
      setAddOpen(false);
      setCreationSuccess(true);
      fetchAnnouncements(); // Refresh the list
    } catch (err) {
      setError('Failed to create announcement');
      console.error('Error creating announcement:', err);
    }
  };

  const clearAllFilters = () => {
    setPriorityFilter(null);
    setTypeFilter(null);
    setCourseFilter(null);
    setSemesterFilter(null);
    setSearch('');
  };

  const handleEditAnnouncement = (announcement: AnnouncementType) => {
    setAnnouncementToEdit(announcement);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setAnnouncementToEdit(null);
  };
  const handleUpdateAnnouncement = async (formData: any) => {
    if (!announcementToEdit) return;
    try {
      await announcementService.updateAnnouncement(announcementToEdit._id, formData);
      setEditOpen(false);
      setAnnouncementToEdit(null);
      setEditSuccess(true);
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to update announcement');
      console.error('Error updating announcement:', err);
    }
  };

  if (loading && announcements.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Announcements"
        searchValue={search}
        onSearch={setSearch}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {userRole !== 'student' && (
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
        )}
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
        <Button
          variant="outlined"
          onClick={clearAllFilters}
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
                  key={a._id}
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
                          By {item.instructorName} • {new Date(item.publishDate).toLocaleDateString()}
                        </Typography>
                        <Box mb={1}>
                          {item.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                          ))}
                        </Box>
                        <Stack direction="row" spacing={1} mt={2}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleShow(item)}
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
                          {userRole !== 'student' && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleRequestDelete(item)}
                              sx={{ borderRadius: 999, fontWeight: 700 }}
                            >
                              Delete
                            </Button>
                          )}
                          {userRole !== 'student' && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleEditAnnouncement(item)}
                              sx={{ borderRadius: 999, fontWeight: 700 }}
                            >
                              Edit
                            </Button>
                          )}
                        </Stack>
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
            <CommonTable
              columns={announcementColumns}
              rows={pagedAnnouncements}
              actions={row => (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleShow(row)}
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
                  {userRole !== 'student' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRequestDelete(row)}
                      sx={{ borderRadius: 999, fontWeight: 700 }}
                    >
                      Delete
                    </Button>
                  )}
                  {userRole !== 'student' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditAnnouncement(row)}
                      sx={{ borderRadius: 999, fontWeight: 700 }}
                    >
                      Edit
                    </Button>
                  )}
                </Stack>
              )}
            />
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

      {/* View Announcement Modal */}
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
                Published: {new Date(selected.publishDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Expires: {selected.expiryDate ? new Date(selected.expiryDate).toLocaleDateString() : 'N/A'}
              </Typography>
              <Box mb={2}>
                {selected.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                ))}
              </Box>
              {selected.attachments && selected.attachments.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Attachments:</Typography>
                  {selected.attachments.map((attachment, index) => (
                    <Chip
                      key={index}
                      label={attachment.fileName}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                      onClick={() => window.open(attachment.fileUrl, '_blank')}
                      clickable
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Announcement Modal */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>Add New Announcement</DialogTitle>
        <DialogContent dividers>
          <AddAnnouncementForm onSubmit={handleCreateAnnouncement} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={creationSuccess}
        autoHideDuration={3000}
        onClose={() => setCreationSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="Announcement created successfully!"
      />
      <Snackbar
        open={deleteSuccess}
        autoHideDuration={3000}
        onClose={() => setDeleteSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="Announcement deleted successfully!"
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the announcement "{announcementToDelete?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => announcementToDelete && handleDeleteAnnouncement(announcementToDelete._id)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={handleEditClose}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>Edit Announcement</DialogTitle>
        <DialogContent dividers>
          {announcementToEdit && (
            <EditAnnouncementForm announcement={announcementToEdit} onSubmit={handleUpdateAnnouncement} onCancel={handleEditClose} />
          )}
        </DialogContent>
      </Dialog>
      <Snackbar
        open={editSuccess}
        autoHideDuration={3000}
        onClose={() => setEditSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="Announcement updated successfully!"
      />
    </Box>
  );
};

// Add Announcement Form Component
interface AddAnnouncementFormProps {
  onSubmit: (data: CreateAnnouncementRequest) => void;
  onCancel: () => void;
}

const AddAnnouncementForm: React.FC<AddAnnouncementFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateAnnouncementRequest>({
    title: '',
    content: '',
    instructorName: '',
    course: '',
    priority: 'medium',
    type: 'general',
    semester: '',
    tags: [],
    publishDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        fullWidth
      />
      <TextField
        label="Content"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        required
        fullWidth
        multiline
        rows={4}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          label="Instructor Name"
          value={formData.instructorName}
          onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
          required
          fullWidth
        />
        <TextField
          label="Course"
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          required
          fullWidth
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          select
          label="Priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
          required
          fullWidth
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </TextField>
        <TextField
          select
          label="Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          required
          fullWidth
        >
          <MenuItem value="general">General</MenuItem>
          <MenuItem value="assignment">Assignment</MenuItem>
          <MenuItem value="exam">Exam</MenuItem>
          <MenuItem value="event">Event</MenuItem>
          <MenuItem value="deadline">Deadline</MenuItem>
        </TextField>
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Semester"
          value={formData.semester}
          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
          required
          fullWidth
        />
        <TextField
          label="Publish Date"
          type="date"
          value={formData.publishDate}
          onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 999, fontWeight: 700 }}>
          Cancel
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
  );
};

// Add EditAnnouncementForm below AddAnnouncementForm:
interface EditAnnouncementFormProps {
  announcement: AnnouncementType;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}
const EditAnnouncementForm: React.FC<EditAnnouncementFormProps> = ({ announcement, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ ...announcement });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required fullWidth />
      <TextField label="Content" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required fullWidth multiline rows={4} />
      <Stack direction="row" spacing={2}>
        <TextField label="Instructor Name" value={formData.instructorName} onChange={e => setFormData({ ...formData, instructorName: e.target.value })} required fullWidth />
        <TextField label="Course" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} required fullWidth />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField select label="Priority" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })} required fullWidth >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </TextField>
        <TextField select label="Type" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as 'general' | 'assignment' | 'exam' | 'event' | 'deadline' })} required fullWidth >
          <MenuItem value="general">General</MenuItem>
          <MenuItem value="assignment">Assignment</MenuItem>
          <MenuItem value="exam">Exam</MenuItem>
          <MenuItem value="event">Event</MenuItem>
          <MenuItem value="deadline">Deadline</MenuItem>
        </TextField>
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Semester" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} required fullWidth />
        <TextField label="Publish Date" type="date" value={formData.publishDate?.slice(0,10)} onChange={e => setFormData({ ...formData, publishDate: e.target.value })} required fullWidth InputLabelProps={{ shrink: true }} />
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 999, fontWeight: 700 }}>Cancel</Button>
        <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)', color: '#fff', borderRadius: 999, fontWeight: 700, px: 3, py: 1.2, boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)', textTransform: 'none', transition: 'all 0.2s cubic-bezier(.4,0,.2,1)', '&:hover': { background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)', boxShadow: '0 4px 16px 0 rgba(37,99,235,0.15)', transform: 'translateY(-2px) scale(1.04)', }, }}>Update</Button>
      </Stack>
    </Box>
  );
};

export default Announcements; 