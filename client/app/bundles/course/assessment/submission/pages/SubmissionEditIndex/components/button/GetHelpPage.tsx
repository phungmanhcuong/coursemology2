import { FC, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Close, Send } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { blue, grey } from '@mui/material/colors';

import {
  generateLiveFeedback,
  initializeLiveFeedback,
} from 'course/assessment/submission/actions/answers';
import actionTypes, {
  workflowStates,
} from 'course/assessment/submission/constants'; // Adjust the import path as necessary
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getLiveFeedbacks } from 'course/assessment/submission/selectors/liveFeedbacks';
import { getQuestionFlags } from 'course/assessment/submission/selectors/questionFlags';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translationsGlobal from 'course/assessment/submission/translations';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  chatWithCodaveri: {
    id: 'gethelp.chatWithCodaveri',
    defaultMessage: 'Get Help',
  },
  typeYourMessage: {
    id: 'gethelp.typeYourMessage',
    defaultMessage: 'Type your message...',
  },
  nextQuestions: {
    id: 'gethelp.nextQuestions',
    defaultMessage: 'Next Questions',
  },
});

interface GetHelpPageProps {
  stepIndex: number;
}

const GetHelpPage: FC<GetHelpPageProps> = (props) => {
  const { t } = useTranslation();
  const { stepIndex } = props;
  const dispatch = useAppDispatch();
  const { formatMessage } = useIntl();
  const [messages, setMessages] = useState<
    { text: string; sender: 'Codaveri' | 'Student'; timestamp: string }[]
  >([]);
  const [input, setInput] = useState<string>('');
  const [open, setOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [localFeedbackFiles, setLocalFeedbackFiles] = useState<unknown[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);
  const questionFlags = useAppSelector(getQuestionFlags);
  const liveFeedback = useAppSelector(getLiveFeedbacks);
  const submissionId = getSubmissionId();
  const { questionIds } = assessment;
  const questionId = questionIds[stepIndex];
  const question = questions[questionId];
  const { answerId, attemptsLeft } = question;
  const { isResetting } = questionFlags[questionId] || {};

  const isRequestingLiveFeedback =
    liveFeedback?.feedbackByQuestion?.[questionId]?.isRequestingLiveFeedback ??
    false;

  const isPollingLiveFeedback =
    (liveFeedback?.feedbackByQuestion?.[questionId]?.pendingFeedbackToken ??
      false) !== false;

  const feedbackFiles = useAppSelector(
    (state) =>
      state.assessments.submission.liveFeedback?.feedbackByQuestion?.[
        question.id
      ]?.feedbackFiles ?? [],
  );

  // const isShowingPopup = useAppSelector(
  //   (state) =>
  //     state.assessments.submission.liveFeedback?.feedbackByQuestion?.[
  //       question.id
  //     ]?.isShowingPopup ?? false,
  // );

  const isShowingPopup =
    liveFeedback?.feedbackByQuestion?.[questionId]?.isShowingPopup === false;

  useEffect(() => {
    if (!isRequestingLiveFeedback && !isPollingLiveFeedback) {
      setMessages(feedbackFiles);
    }
    setLoading(isPollingLiveFeedback);
  }, [isRequestingLiveFeedback, isPollingLiveFeedback, feedbackFiles]);

  const handleSendMessage = async (): Promise<void> => {
    if (input.trim()) {
      const questionIndex =
        questionIds.findIndex((id) => id === questionId) + 1;
      const successMessage = t(translationsGlobal.liveFeedbackSuccess, {
        questionIndex,
      });
      const noFeedbackMessage = t(
        translationsGlobal.liveFeedbackNoneGenerated,
        {
          questionIndex,
        },
      );

      setInput('');
      // dispatch(initializeLiveFeedback(questionId));
      dispatch({
        type: actionTypes.LIVE_FEEDBACK_USER_REQUEST,
        payload: {
          questionId,
          answerId,
          userRequest: input,
        },
      });
      dispatch(
        generateLiveFeedback({
          submissionId,
          answerId,
          questionId,
          successMessage,
          noFeedbackMessage,
        }),
      );
    }
  };

  const handleSuggestionClick = (suggestion: string): void => {
    setInput(suggestion);
  };

  const suggestions = ['I am stuck', "My code doesn't work"];

  if (!open) return null;

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: '100px',
        marginTop: '16px',
        right: '29px',
        zIndex: 1000,
        width: '28vw',
        height: '41%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: grey[200],
          p: 2,
        }}
      >
        <Typography fontWeight="bold" variant="h5">
          {formatMessage(translations.chatWithCodaveri)}
        </Typography>
        <IconButton
          onClick={() => {
            setOpen(false);
            dispatch({
              type: actionTypes.LIVE_FEEDBACK_OPEN_POPUP,
              payload: {
                questionId,
                isShowingPopup: false,
              },
            });
          }}
          size="small"
        >
          <Close />
        </IconButton>
      </Box>
      <Divider sx={{ my: 0 }} />
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {messages.map((message, index) => (
          <ListItem
            key={index}
            sx={{
              justifyContent:
                message.sender === 'Codaveri' ? 'flex-start' : 'flex-end',
            }}
          >
            <ListItemText
              primary={message.text}
              secondary={message.timestamp}
              sx={{
                backgroundColor:
                  message.sender === 'Codaveri' ? grey[300] : blue[100],
                borderRadius: '10px',
                padding: '10px',
                maxWidth: '60%',
                fontSize: '0.5rem',
              }}
            />
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <Box
        sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{ mx: 1 }}
              variant="outlined"
            >
              {suggestion}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <TextField
            disabled={loading}
            fullWidth
            onChange={(e): void => setInput(e.target.value)}
            onKeyPress={(e): void => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder={formatMessage(translations.typeYourMessage)}
            sx={{
              borderRadius: '20px',
              padding: '10px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
            value={input}
            variant="outlined"
          />
          <IconButton
            disabled={loading}
            onClick={handleSendMessage}
            sx={{ fontSize: '4rem', padding: '16px' }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default GetHelpPage;
