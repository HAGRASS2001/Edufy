import React, { useState } from 'react';
import {
  Box, Typography, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, Slide, IconButton, Stack, Switch, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Autocomplete, Pagination, InputAdornment
} from '@mui/material';
import { Quiz, Close, TableRows, ViewModule, Add, Search as SearchIcon } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import CommonTable, { Column } from '../components/CommonTable';
import PageHeader from '../components/layout/PageHeader';

// Dummy data matching the QuizSchema
const dummyQuizzes = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Quiz ${i + 1}`,
  description: `This is a description for quiz ${i + 1}. It might be long, so it will be truncated in the card view.`,
  course: `Course ${i % 3 + 1}`,
  instructor: `Instructor ${i % 2 + 1}`,
  semester: `2023/2024 - S${(i % 2) + 1}`,
  duration: 60 + i * 5,
  totalMarks: 100,
  passingMarks: 50,
  studentMarks: 40 + i * 2,
  difficulty: ['easy', 'medium', 'hard'][i % 3],
  category: ['assignment', 'practice', 'midterm', 'final'][i % 4],
  isPublished: i % 2 === 0,
  startDate: new Date(2024, 4, i + 1),
  endDate: new Date(2024, 4, i + 2),
  tags: ['important', 'math', i % 2 === 0 ? 'midterm' : 'final'],
}));

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
const statusColors: Record<string, string> = {
  Published: '#22c55e',
  Unpublished: '#64748b',
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const quizColumns: Column<typeof dummyQuizzes[0]>[] = [
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
  { label: 'Status', field: 'isPublished', renderCell: q => <Chip label={q.isPublished ? 'Published' : 'Unpublished'} size="small" sx={{ bgcolor: q.isPublished ? statusColors.Published : statusColors.Unpublished, color: '#fff', fontWeight: 700 }} /> },
  { label: 'Start', field: 'startDate', renderCell: q => q.startDate.toLocaleDateString() },
  { label: 'End', field: 'endDate', renderCell: q => q.endDate.toLocaleDateString() },
  { label: 'Tags', field: 'tags', renderCell: q => q.tags.map(tag => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />) },
];

const Quizzes = () => {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<typeof dummyQuizzes[0] | null>(null);
  const [tableView, setTableView] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<string | null>(null);
  const [instructorFilter, setInstructorFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Extract unique values for filters
  const courseOptions = Array.from(new Set(dummyQuizzes.map(q => q.course)));
  const semesterOptions = Array.from(new Set(dummyQuizzes.map(q => q.semester)));
  const instructorOptions = Array.from(new Set(dummyQuizzes.map(q => q.instructor)));

  // Filtering logic
  const filteredQuizzes = dummyQuizzes.filter(q => {
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

  const handleShow = (quiz: typeof dummyQuizzes[0]) => {
    setSelected(quiz);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Quizzes"
        searchValue={search}
        onSearch={setSearch}
      />
      {/* Add Quiz + View Switch */}
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
          Add Quiz
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
        <TextField
          label="Search"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setDifficultyFilter(null);
            setCategoryFilter(null);
            setCourseFilter(null);
            setSemesterFilter(null);
            setInstructorFilter(null);
            setDateRange({ start: '', end: '' });
            setSearch('');
          }}
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
                  key={q.id}
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
                      <Chip label={q.isPublished ? 'Published' : 'Unpublished'} size="small" sx={{ bgcolor: q.isPublished ? statusColors.Published : statusColors.Unpublished, color: '#fff', fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="h6" fontWeight={700} mb={0.5}>{q.title}</Typography>
                    <Typography variant="body2" color="#374151" mb={1}>
                      {q.description.length > 80 ? q.description.slice(0, 80) + '...' : q.description}
                    </Typography>
                    <Typography variant="caption" color="#64748b" display="block" mb={1}>
                      {q.course} • {q.instructor} • {q.semester}
                    </Typography>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip label={`Duration: ${q.duration} min`} size="small" />
                      <Chip label={`Total: ${q.totalMarks}`} size="small" />
                      <Chip label={`Passing: ${q.passingMarks}`} size="small" />
                      <Chip label={`Your Marks: ${q.studentMarks}`} size="small" />
                    </Stack>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip label={`Start: ${q.startDate.toLocaleDateString()}`} size="small" />
                      <Chip label={`End: ${q.endDate.toLocaleDateString()}`} size="small" />
                    </Stack>
                    <Box mb={1}>
                      {q.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleShow(q)}
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
      {/* Add Quiz Modal */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add New Quiz
          <IconButton onClick={() => setAddOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={e => { e.preventDefault(); setAddOpen(false); }}>
            <Stack spacing={2}>
              <TextField label="Title" fullWidth required />
              <TextField label="Description" fullWidth multiline minRows={2} />
              <TextField label="Course" fullWidth required />
              <TextField label="Instructor" fullWidth required />
              <TextField label="Semester" fullWidth required />
              <Stack direction="row" spacing={2}>
                <TextField label="Difficulty" select defaultValue="medium" fullWidth>
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </TextField>
                <TextField label="Category" select defaultValue="assignment" fullWidth>
                  <MenuItem value="assignment">Assignment</MenuItem>
                  <MenuItem value="practice">Practice</MenuItem>
                  <MenuItem value="midterm">Midterm</MenuItem>
                  <MenuItem value="final">Final</MenuItem>
                </TextField>
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label="Duration (min)" type="number" fullWidth required />
                <TextField label="Total Marks" type="number" fullWidth required />
                <TextField label="Passing Marks" type="number" fullWidth required />
                <TextField label="Your Marks" type="number" fullWidth required />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label="Start Date" type="date" InputLabelProps={{ shrink: true }} fullWidth required />
                <TextField label="End Date" type="date" InputLabelProps={{ shrink: true }} fullWidth required />
              </Stack>
              <TextField label="Tags (comma separated)" fullWidth />
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
      {/* Quiz Details Modal */}
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
                Status: <Chip label={selected.isPublished ? 'Published' : 'Unpublished'} size="small" sx={{ bgcolor: selected.isPublished ? statusColors.Published : statusColors.Unpublished, color: '#fff', fontWeight: 700 }} />
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Start: {selected.startDate.toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                End: {selected.endDate.toLocaleDateString()}
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
    </Box>
  );
};

export default Quizzes; 