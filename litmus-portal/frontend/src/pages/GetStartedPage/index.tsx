import { Typography } from '@material-ui/core';
import { ButtonFilled, InputField, TextButton } from 'litmus-ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import config from '../../config';
import {
  getToken,
  getUserEmail,
  getUserFullName,
  getUserId,
  getUsername,
  logout,
} from '../../utils/auth';
import { validateConfirmPassword } from '../../utils/validate';
import LoginWrapper from '../../views/Login';
import useStyles from './styles';

interface PasswordReset {
  password: string;
  confirmPassword: string;
}

const GetStarted: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [values, setValues] = React.useState<PasswordReset>({
    password: '',
    confirmPassword: '',
  });
  const isError = useRef(true);
  const isSuccess = useRef(false);
  if (
    values.password.length &&
    values.confirmPassword.length &&
    !validateConfirmPassword(values.password, values.confirmPassword)
  ) {
    isError.current = false;
    isSuccess.current = true;
  } else {
    isError.current = true;
    isSuccess.current = false;
  }

  const [loading, setIsLoading] = useState<boolean>(false);

  // Checking if token is valid or not by finding the uid in database
  const ValidateUser = () => {
    fetch(`${config.auth.url}/getUser/${getUserId()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
          // eslint-disable-next-line no-alert
          window.alert('Token expired, please login again');
          logout();
        }
      })
      .catch((err) => {
        console.error(err);
        logout();
      });
    return true;
  };

  useEffect(() => {
    ValidateUser();
  }, []);

  const createProject = () => {
    fetch(`${config.auth.url}/create_project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        project_name: `${getUsername()}'s project`,
        user_id: getUserId(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else {
          window.location.assign(`${process.env.PUBLIC_URL}/home`);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };


  //DASH:- To add the New User to Default Project
  const addToDefaultProject = () => {
    fetch(`${config.auth.url}/add_default_member`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        project_name: `${getUsername()}'s project`,
        user_id: getUserId(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          console.error(data);
        } else {
          window.location.assign(`${process.env.PUBLIC_URL}/home`);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // Submit entered data to /update/details endpoint
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    fetch(`${config.auth.url}/update/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        email: getUserEmail(),
        name: getUserFullName(),
        password: values.password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if ('error' in data) {
          isError.current = true;
        } else {
          //DASH: To add a user to default project
          addToDefaultProject();
        }
      })
      .catch((err) => {
        isError.current = true;
        console.error(err);
      });
  };

  const loaderSize = 20;

  return (
    <LoginWrapper
      title="Welcome to Flipkart Litmus Chaos"
      subtitle="You will be added now as a owner in default project, but please note you won't be able to run any chaos scenarios there. 
      Ask your Project Owner to extend an Invite to you.
      If you want to become a Project owner, then contact Central-SRE"
    >
      <form
        id="login-form"
        className={classes.inputDiv}
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          if (ValidateUser()) {
            handleSubmit(event);
          }
        }}
      >  {/* DASH: Disabling */}
        {/* <InputField
          data-cy="inputPassword"
          className={classes.inputValue}
          label={t('getStarted.password.label')}
          type="password"
          filled
          required
          value={values.password}
          onChange={(event) => {
            setValues({
              password: event.target.value,
              confirmPassword: values.confirmPassword,
            });
          }}
        /> */}
        {/* <InputField
          data-cy="confirmInputPassword"
          className={classes.inputValue}
          label={t('getStarted.password.cnfLabel')}
          type="password"
          required
          value={values.confirmPassword}
          helperText={
            validateConfirmPassword(values.password, values.confirmPassword)
              ? t('settings.accountsTab.accountsSettings.passwordNotSame')
              : ''
          }
          filled
          onChange={(event) =>
            setValues({
              password: values.password,
              confirmPassword: event.target.value,
            })
          }
        /> */}
        <div className={classes.buttonGroup}>
          {/* <div data-cy="skipButton">
            <TextButton
              className={classes.skipButton}
              title="Skip for now"
              variant="highlight"
              onClick={() => {
                if (ValidateUser()) {
                  setIsLoading(true);
                  addToDefaultProject();
                }
              }}
            >
              {loading ? (
                <Loader size={loaderSize} />
              ) : (
                <Typography>{t('getStarted.button.skip')}</Typography>
              )}
            </TextButton>
          </div> */}
          <div data-cy="finishButton">
            <ButtonFilled
              className={classes.skipButton}
              title="Enter to Chaos Tool Now"
              onClick={() => {
                if (ValidateUser()) {
                  setIsLoading(true);
                  //DASH: To add to default Project
                  addToDefaultProject();
                }
              }}
            >
              {loading ? (
                <Loader size={loaderSize} />
              ) : (
                <>Enter Here</>
              )}
            </ButtonFilled>
          </div>
        </div>
      </form>
    </LoginWrapper>
  );
};

export default GetStarted;