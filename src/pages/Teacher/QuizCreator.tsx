import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Add,
  Delete,
  Visibility,
  Save,
  ArrowBack,
} from '@mui/icons-material';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const QuizCreator: React.FC = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    },
  ]);
  const [openPreview, setOpenPreview] = useState(false);
  const [currentPreviewQuestion, setCurrentPreviewQuestion] = useState(0);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof QuizQuestion, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSaveQuiz = () => {
    if (!quizTitle || questions.some(q => !q.question || q.options.some(o => !o))) {
      alert('Please fill in all fields');
      return;
    }
    alert('Quiz saved successfully!');
  };

  const handlePreview = () => {
    setCurrentPreviewQuestion(0);
    setOpenPreview(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => window.history.back()}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={600}>
            Create New Quiz
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Design your quiz with questions and answers
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Visibility />}
          onClick={handlePreview}
        >
          Preview
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveQuiz}
        >
          Save Quiz
        </Button>
      </Box>

      {/* Quiz Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quiz Details
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Quiz Title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="e.g., React Fundamentals Quiz"
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
            placeholder="Brief description of what this quiz covers"
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            sx={{ maxWidth: 200 }}
          />
        </Box>
      </Paper>

      {/* Questions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Questions ({questions.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={addQuestion}
        >
          Add Question
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Question {qIndex + 1}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeQuestion(question.id)}
                  disabled={questions.length === 1}
                >
                  <Delete />
                </IconButton>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Question"
                value={question.question}
                onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                placeholder="Enter your question here"
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Answer Options
              </Typography>
              <RadioGroup
                value={question.correctAnswer}
                onChange={(e) => updateQuestion(question.id, 'correctAnswer', parseInt(e.target.value))}
              >
                {question.options.map((option, oIndex) => (
                  <Box key={oIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <FormControlLabel
                      value={oIndex}
                      control={<Radio />}
                      label=""
                      sx={{ mr: 0 }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                      placeholder={`Enter option ${oIndex + 1}`}
                    />
                  </Box>
                ))}
              </RadioGroup>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="caption">
                  ✓ Correct Answer: Option {question.correctAnswer + 1}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Preview Dialog */}
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6">{quizTitle || 'Quiz Preview'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {quizDescription}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Question ${currentPreviewQuestion + 1} of ${questions.length}`}
              color="primary"
              size="small"
            />
            <Chip
              label={`${duration} minutes`}
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>

          {questions[currentPreviewQuestion] && (
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>
                {questions[currentPreviewQuestion].question || 'Question text will appear here'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <RadioGroup>
                {questions[currentPreviewQuestion].options.map((option, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={idx}
                    control={<Radio />}
                    label={option || `Option ${idx + 1}`}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </Paper>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={currentPreviewQuestion === 0}
              onClick={() => setCurrentPreviewQuestion(prev => prev - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={currentPreviewQuestion === questions.length - 1}
              onClick={() => setCurrentPreviewQuestion(prev => prev + 1)}
              variant="contained"
            >
              Next
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close Preview</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizCreator;
