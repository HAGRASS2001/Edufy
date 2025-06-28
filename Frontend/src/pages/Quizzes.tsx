import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Slide, IconButton, Stack, Switch, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Autocomplete, Pagination, InputAdornment, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { Quiz, Close, TableRows, ViewModule, Add, Search as SearchIcon } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import CommonTable, { Column } from '../components/CommonTable';
import PageHeader from '../components/layout/PageHeader';
import { quizService } from '../services/quizService';
import { userService } from '../services/userService';
import { Quiz as QuizType, CreateQuizRequest } from '../types/quiz';
import { useAppSelector } from '../store/store';

const CARDS_PER_ROW = 3;
const ROWS_PER_PAGE = 3;
const CARDS_PER_PAGE = CARDS_PER_ROW * ROWS_PER_PAGE;

const difficultyColors: Record<string, string> = {
  easy: '#60d394',
  medium: '#fbbf24',
  hard: '#ef4444',
};
const categoryColors: Record<string, string> = {
  assignment: '#6366f1',
  practice: '#2563eb',
  midterm: '#f59e42',
  final: '#a21caf',
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const quizColumns: Column<QuizType>[] = [
  { label: 'Title', field: 'title' },
  { label: 'Course', field: 'course' },
  { label: 'Instructor', field: 'instructor' },
  { label: 'Semester', field: 'semester' },
  { label: 'Difficulty', field: 'difficulty', renderCell: q => <Chip label={q.difficulty} size="small" sx={{ bgcolor: difficultyColors[q.difficulty], color: '#fff', fontWeight: 700, textTransform: 'capitalize' }} /> },
  { label: 'Category', field: 'category', renderCell: q => <Chip label={q.category} size="small" sx={{ bgcolor: categoryColors[q.category], color: '#fff', fontWeight: 700, textTransform: 'capitalize' }} /> },
  { label: 'Duration', field: 'duration', renderCell: q => `${q.duration} min` },
  { label: 'Total', field: 'totalMarks' },
  { label: 'Passing', field: 'passingMarks' },
  { label: 'Your Marks', field: 'studentMarks' },
  { label: 'Start', field: 'startDate', renderCell: q => new Date(q.startDate).toLocaleDateString() },
  { label: 'End', field: 'endDate', renderCell: q => new Date(q.endDate).toLocaleDateString() },
  { label: 'Tags', field: 'tags', renderCell: q => q.tags.map(tag => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />) },
];

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<QuizType | null>(null);
  const [tableView, setTableView] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<string | null>(null);
  const [instructorFilter, setInstructorFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizType | null>(null);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<QuizType | null>(null);
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

 
  const courseOptions = Array.from(new Set((quizzes || []).map(q => q.course)));
  const semesterOptions = Array.from(new Set((quizzes || []).map(q => q.semester)));
  const instructorOptions = Array.from(new Set((quizzes || []).map(q => q.instructor)));

  // Fetch quizzes from API
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (userRole === 'student') {
        data = await quizService.getStudentQuizzes(user._id);
      } else {
        data = await quizService.getQuizzes();
      }
      
      const quizzesArray = Array.isArray(data) ? data : (data.quizzes || []);
      setQuizzes(quizzesArray);
    } catch (err) {
      setError('Failed to fetch quizzes');
      console.error('Error fetching quizzes:', err);
      setQuizzes([]); 
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchQuizzes();
  }, [userRole, user?._id]);

  // Filtering logic 
  const filteredQuizzes = (quizzes || []).filter(q => {
    const matchesDifficulty = !difficultyFilter || q.difficulty === difficultyFilter;
    const matchesCategory = !categoryFilter || q.category === categoryFilter;
    const matchesCourse = !courseFilter || q.course === courseFilter;
    const matchesSemester = !semesterFilter || q.semester === semesterFilter;
    const matchesInstructor = !instructorFilter || q.instructor === instructorFilter;
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase());
    const matchesDate =
      (!dateRange.start || new Date(q.startDate) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(q.endDate) <= new Date(dateRange.end));
    return (
      matchesDifficulty &&
      matchesCategory &&
      matchesCourse &&
      matchesSemester &&
      matchesInstructor &&
      matchesSearch &&
      matchesDate
    );
  });

  const pageCount = Math.ceil(filteredQuizzes.length / CARDS_PER_PAGE);
  const pagedQuizzes = filteredQuizzes.slice(
    (page - 1) * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE
  );

  const handleShow = (quiz: QuizType) => {
    setSelected(quiz);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const handleRequestDelete = (quiz: QuizType) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleCreateQuiz = async (formData: CreateQuizRequest) => {
    try {
      const quiz = await quizService.createQuiz(formData);
      setAddOpen(false);
      setCreationSuccess(true);
      fetchQuizzes();
      return quiz;
    } catch (err) {
      setError('Failed to create quiz');
      console.error('Error creating quiz:', err);
      return null;
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      await quizService.deleteQuiz(id);
      if (selected?._id === id) {
        handleClose();
      }
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
      setDeleteSuccess(true);
      fetchQuizzes();
    } catch (err) {
      setError('Failed to delete quiz');
      console.error('Error deleting quiz:', err);
    }
  };

  const clearAllFilters = () => {
    setDifficultyFilter(null);
    setCategoryFilter(null);
    setCourseFilter(null);
    setSemesterFilter(null);
    setInstructorFilter(null);
    setDateRange({ start: '', end: '' });
    setSearch('');
  };

  const handleEditQuiz = (quiz: QuizType) => {
    setQuizToEdit(quiz);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setQuizToEdit(null);
  };
  const handleUpdateQuiz = async (formData: any) => {
    if (!quizToEdit) return;
    try {
      const updatedQuiz = await quizService.updateQuiz(quizToEdit._id, formData);
      setEditOpen(false);
      setQuizToEdit(null);
      setEditSuccess(true);
      fetchQuizzes();
      return updatedQuiz;
    } catch (err) {
      setError('Failed to update quiz');
      console.error('Error updating quiz:', err);
      return null;
    }
  };

  if (loading && quizzes.length === 0) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Quizzes"
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
            Add Quiz
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
          options={['easy', 'medium', 'hard']}
          value={difficultyFilter}
          onChange={(_, v) => setDifficultyFilter(v)}
          renderInput={params => <TextField {...params} label="Difficulty" size="small" />}
          sx={{ minWidth: 140 }}
          clearOnEscape
        />
        <Autocomplete
          options={['assignment', 'practice', 'midterm', 'final']}
          value={categoryFilter}
          onChange={(_, v) => setCategoryFilter(v)}
          renderInput={params => <TextField {...params} label="Category" size="small" />}
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
        <Autocomplete
          options={instructorOptions}
          value={instructorFilter}
          onChange={(_, v) => setInstructorFilter(v)}
          renderInput={params => <TextField {...params} label="Instructor" size="small" />}
          sx={{ minWidth: 140 }}
          clearOnEscape
        />
        <TextField
          label="Start Date"
          type="date"
          size="small"
          value={dateRange.start}
          onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140 }}
        />
        <TextField
          label="End Date"
          type="date"
          size="small"
          value={dateRange.end}
          onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140 }}
        />
        <Button
          variant="outlined"
          onClick={clearAllFilters}
          sx={{ ml: 'auto', borderRadius: 999, fontWeight: 700 }}
        >
          Clear Filters
        </Button>
      </Paper>
      {/* Card/Table View with Animation */}
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
              {pagedQuizzes.map(q => (
                <Box
                  key={q._id}
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
                  <Paper sx={{ borderRadius: 3, boxShadow: 1, p: 2, mb: 1, background: '#fff', color: '#1f2937' }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Chip label={q.difficulty} size="small" sx={{ bgcolor: difficultyColors[q.difficulty], color: '#fff', fontWeight: 700, textTransform: 'capitalize' }} />
                      <Chip label={q.category} size="small" sx={{ bgcolor: categoryColors[q.category], color: '#fff', fontWeight: 700, textTransform: 'capitalize' }} />
                    </Stack>
                    <Typography variant="h6" fontWeight={700} mb={0.5}>{q.title}</Typography>
                    <Typography variant="body2" color="#374151" mb={1}>
                      {q.description.length > 80 ? q.description.slice(0, 80) + '...' : q.description}
                    </Typography>
                    <Typography variant="caption" color="#64748b" display="block" mb={1}>
                      {q.course} • {q.instructor} • {q.semester}
                    </Typography>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip label={`Total: ${q.totalMarks}`} size="small" />
                      <Chip label={`Passing: ${q.passingMarks}`} size="small" />
                      <Chip label={`Your Marks: ${q.studentMarks}`} size="small" />
                    </Stack>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip label={`Duration: ${q.duration} min`} size="small" />
                      <Chip label={`Start: ${new Date(q.startDate).toLocaleDateString()}`} size="small" />
                      <Chip label={`End: ${new Date(q.endDate).toLocaleDateString()}`} size="small" />
                    </Stack>
                    <Box mb={1}>
                      {q.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleShow(q)}
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
                          onClick={() => handleRequestDelete(q)}
                          sx={{ borderRadius: 999, fontWeight: 700 }}
                        >
                          Delete
                        </Button>
                      )}
                      {userRole !== 'student' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditQuiz(q)}
                          sx={{ borderRadius: 999, fontWeight: 700 }}
                        >
                          Edit
                        </Button>
                      )}
                    </Stack>
                  </Paper>
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
              columns={quizColumns}
              rows={pagedQuizzes}
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
                      onClick={() => handleEditQuiz(row)}
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

      {/* View Quiz Modal */}
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
              <Typography variant="subtitle1" fontWeight={600} mb={1}>{selected.category.toUpperCase()} • {selected.difficulty.toUpperCase()}</Typography>
              <Typography variant="body1" mb={2}>{selected.description}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Course: {selected.course}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Instructor: {selected.instructor}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Semester: {selected.semester}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Duration: {selected.duration} min
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Total Marks: {selected.totalMarks}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Passing Marks: {selected.passingMarks}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Your Marks: {selected.studentMarks}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Start Date: {new Date(selected.startDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                End Date: {new Date(selected.endDate).toLocaleDateString()}
              </Typography>
              <Box mb={2}>
                {selected.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Quiz Modal */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>Add New Quiz</DialogTitle>
        <DialogContent dividers>
          <AddQuizForm onSubmit={handleCreateQuiz} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={creationSuccess}
        autoHideDuration={3000}
        onClose={() => setCreationSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="Quiz created successfully!"
      />
      <Snackbar
        open={deleteSuccess}
        autoHideDuration={3000}
        onClose={() => setDeleteSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="Quiz deleted successfully!"
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the quiz "{quizToDelete?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => quizToDelete && handleDeleteQuiz(quizToDelete._id)} color="error" variant="contained">
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
        <DialogTitle>Edit Quiz</DialogTitle>
        <DialogContent dividers>
          {quizToEdit && (
            <EditQuizForm quiz={quizToEdit} onSubmit={handleUpdateQuiz} onCancel={handleEditClose} />
          )}
        </DialogContent>
      </Dialog>
      <Snackbar
        open={editSuccess}
        autoHideDuration={3000}
        onClose={() => setEditSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message="Quiz updated successfully!"
      />
    </Box>
  );
};

// Add Quiz Form Component
interface AddQuizFormProps {
  onSubmit: (data: CreateQuizRequest) => Promise<any>;
  onCancel: () => void;
}

const AddQuizForm: React.FC<AddQuizFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateQuizRequest>({
    title: '',
    description: '',
    course: '',
    instructor: '',
    semester: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 50,
    studentMarks: 0,
    difficulty: 'medium',
    category: 'assignment',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: [],
    assignedStudents: [],
  });
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  useEffect(() => {
    userService.getAllUsers().then(usersObj => {
      const users = Array.isArray(usersObj) ? usersObj : usersObj.users;
      setStudents(users.filter((u: any) => u.role === 'student'));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quizData = {
      ...formData,
      assignedStudents: selectedStudent ? [selectedStudent._id] : []
    };
    await onSubmit(quizData);
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
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
        fullWidth
        multiline
        rows={4}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          label="Course"
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          required
          fullWidth
        />
        <TextField
          label="Instructor"
          value={formData.instructor}
          onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
          required
          fullWidth
        />
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
          label="Duration (minutes)"
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          required
          fullWidth
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Total Marks"
          type="number"
          value={formData.totalMarks}
          onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
          required
          fullWidth
        />
        <TextField
          label="Passing Marks"
          type="number"
          value={formData.passingMarks}
          onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
          required
          fullWidth
        />
        <TextField
          label="Student Marks"
          type="number"
          value={formData.studentMarks}
          onChange={(e) => setFormData({ ...formData, studentMarks: parseInt(e.target.value) })}
          required
          fullWidth
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          select
          label="Difficulty"
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })}
          required
          fullWidth
        >
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </TextField>
        <TextField
          select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as "assignment" | "practice" | "midterm" | "final" })}
          required
          fullWidth
        >
          <MenuItem value="assignment">Assignment</MenuItem>
          <MenuItem value="practice">Practice</MenuItem>
          <MenuItem value="midterm">Midterm</MenuItem>
          <MenuItem value="final">Final</MenuItem>
        </TextField>
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <Autocomplete
        options={students}
        getOptionLabel={option => `${option.studentId || ''} - ${option.name}`}
        value={selectedStudent}
        onChange={(_, value) => setSelectedStudent(value)}
        renderInput={params => <TextField {...params} label="Assign to Student" variant="standard" />}
        sx={{ mb: 2 }}
      />
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

// Add EditQuizForm below AddQuizForm:
interface EditQuizFormProps {
  quiz: QuizType;
  onSubmit: (data: any) => Promise<any>;
  onCancel: () => void;
}
const EditQuizForm: React.FC<EditQuizFormProps> = ({ quiz, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ ...quiz });
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  useEffect(() => {
    userService.getAllUsers().then(usersObj => {
      const users = Array.isArray(usersObj) ? usersObj : usersObj.users;
      setStudents(users.filter((u: any) => u.role === 'student'));
      // Set selected student if quiz has assigned students
      if (quiz.assignedStudents && quiz.assignedStudents.length > 0) {
        const assignedStudent = users.find((u: any) => u._id === quiz.assignedStudents[0]);
        setSelectedStudent(assignedStudent || null);
      }
    });
  }, [quiz]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quizData = {
      ...formData,
      assignedStudents: selectedStudent ? [selectedStudent._id] : []
    };
    await onSubmit(quizData);
  };
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required fullWidth />
      <TextField label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required fullWidth multiline rows={4} />
      <Stack direction="row" spacing={2}>
        <TextField label="Course" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} required fullWidth />
        <TextField label="Instructor" value={formData.instructor} onChange={e => setFormData({ ...formData, instructor: e.target.value })} required fullWidth />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Semester" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} required fullWidth />
        <TextField label="Duration (minutes)" type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })} required fullWidth />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Total Marks" type="number" value={formData.totalMarks} onChange={e => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })} required fullWidth />
        <TextField label="Passing Marks" type="number" value={formData.passingMarks} onChange={e => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })} required fullWidth />
        <TextField label="Student Marks" type="number" value={formData.studentMarks} onChange={e => setFormData({ ...formData, studentMarks: parseInt(e.target.value) })} required fullWidth />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField select label="Difficulty" value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })} required fullWidth >
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </TextField>
        <TextField select label="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as "assignment" | "practice" | "midterm" | "final" })} required fullWidth >
          <MenuItem value="assignment">Assignment</MenuItem>
          <MenuItem value="practice">Practice</MenuItem>
          <MenuItem value="midterm">Midterm</MenuItem>
          <MenuItem value="final">Final</MenuItem>
        </TextField>
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField label="Start Date" type="date" value={formData.startDate?.slice(0,10)} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required fullWidth InputLabelProps={{ shrink: true }} />
        <TextField label="End Date" type="date" value={formData.endDate?.slice(0,10)} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required fullWidth InputLabelProps={{ shrink: true }} />
      </Stack>
      <Autocomplete
        options={students}
        getOptionLabel={option => `${option.studentId || ''} - ${option.name}`}
        value={selectedStudent}
        onChange={(_, value) => setSelectedStudent(value)}
        renderInput={params => <TextField {...params} label="Assign to Student" variant="standard" />}
        sx={{ mb: 2 }}
      />
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 999, fontWeight: 700 }}>Cancel</Button>
        <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)', color: '#fff', borderRadius: 999, fontWeight: 700, px: 3, py: 1.2, boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)', textTransform: 'none', transition: 'all 0.2s cubic-bezier(.4,0,.2,1)', '&:hover': { background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)', boxShadow: '0 4px 16px 0 rgba(37,99,235,0.15)', transform: 'translateY(-2px) scale(1.04)', }, }}>Update</Button>
      </Stack>
    </Box>
  );
};

export default Quizzes; 