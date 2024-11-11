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

import './GetHelpPage.css';

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
  const assessment = useAppSelector(getAssessment);
  const questions = useAppSelector(getQuestions);
  const liveFeedback = useAppSelector(getLiveFeedbacks);
  const submissionId = getSubmissionId();
  const { questionIds } = assessment;
  const questionId = questionIds[stepIndex];
  const question = questions[questionId];
  const { answerId } = question;

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
    <Paper className="get-help-page-paper">
      <Box className="get-help-page-box">
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
      <Divider className="get-help-page-divider" />
      <List className="get-help-page-list">
        {messages.map((message, index) => (
          <ListItem
            key={index}
            sx={{
              justifyContent:
                message.sender === 'Codaveri' ? 'flex-start' : 'flex-end',
            }}
          >
            <ListItemText
              className="get-help-page-listitemtext"
              primary={message.text}
              secondary={message.timestamp}
              sx={{
                backgroundColor:
                  message.sender === 'Codaveri' ? grey[300] : blue[100],
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box className="get-help-page-box-column">
        <Box className="get-help-page-box-center">
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
        <Box className="get-help-page-box-full-width">
          <TextField
            className="get-help-page-textfield"
            disabled={loading}
            fullWidth
            onChange={(e): void => setInput(e.target.value)}
            onKeyDown={(e): void => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSendMessage();
              }
            }}
            placeholder={formatMessage(translations.typeYourMessage)}
            value={input}
            variant="outlined"
          />
          <IconButton
            className="get-help-page-iconbutton"
            disabled={loading}
            onClick={handleSendMessage}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default GetHelpPage;
