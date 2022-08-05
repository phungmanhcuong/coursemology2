import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { AppDispatch } from 'types/store';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  IndividualInvites,
  InvitationsPostData,
  InvitationResult,
} from 'types/system/instance/invitations';
import ErrorText from 'lib/components/ErrorText';
import IndividualInvitations from './IndividualInvitations';
import { inviteUsersFromForm } from '../../operations';

interface Props extends WrappedComponentProps {
  openResultDialog: (invitationResult: InvitationResult) => void;
}

const translations = defineMessages({
  required: {
    id: 'course.userInvitations.IndividualInvitations.error.required',
    defaultMessage: 'Required',
  },
  emailFormat: {
    id: 'course.userInvitations.IndividualInvitations.error.emailFormat',
    defaultMessage: 'Enter a valid email format',
  },
});

const validationSchema = yup.object({
  invitations: yup.array().of(
    yup.object({
      name: yup.string().required(translations.required),
      email: yup
        .string()
        .email(translations.emailFormat)
        .required(translations.required),
      phantom: yup.bool(),
      role: yup.string(),
      timelineAlgorithm: yup.string(),
    }),
  ),
});

const IndividualInviteForm: FC<Props> = (props) => {
  const { openResultDialog } = props;
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const emptyInvitation = {
    name: '',
    email: '',
    role: 'normal',
  };
  const initialValues = {
    invitations: [emptyInvitation],
  };
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState,
    formState: { errors },
  } = useForm<IndividualInvites>({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
  });
  const {
    fields: invitationsFields,
    append: invitationsAppend,
    remove: invitationsRemove,
  } = useFieldArray({
    control,
    name: 'invitations',
  });

  const invitations = watch('invitations');

  // When the values in any of the array invitations fields are changed,
  // 'fields' from useFieldArray are not updated but the internal values of options
  // are already updated in useForm. We then use watch to extract the updated options values
  // and update those to controlledFields as seen below.
  const controlledInvitationsFields = invitationsFields.map((field, index) => ({
    ...field,
    ...invitations[index],
  }));

  useEffect(() => {
    // To add an invitation field by default when all other invitation fields are deleted.
    if (invitationsFields.length === 0) {
      invitationsAppend(emptyInvitation);
    }
  }, [invitationsFields.length === 0]);

  // It's recommended to reset in useEffect as execution order matters
  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset(initialValues);
    }
  }, [formState, reset]);

  const onSubmit = (data: InvitationsPostData): Promise<void> => {
    setIsLoading(true);
    return dispatch(inviteUsersFromForm(data))
      .then((response) => {
        openResultDialog(response);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form
      encType="multipart/form-data"
      id="invite-users-individual-form"
      noValidate
      onSubmit={handleSubmit((data) => onSubmit(data))}
    >
      <ErrorText errors={errors} />
      <IndividualInvitations
        isLoading={isLoading}
        fieldsConfig={{
          control,
          fields: controlledInvitationsFields,
          append: invitationsAppend,
          remove: invitationsRemove,
        }}
      />
    </form>
  );
};

export default injectIntl(IndividualInviteForm);
