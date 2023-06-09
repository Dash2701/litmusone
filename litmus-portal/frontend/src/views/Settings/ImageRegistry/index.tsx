import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import {
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { ButtonFilled, InputField } from 'litmus-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/Loader';
import { constants } from '../../../constants';
import {
  ADD_IMAGE_REGISTRY,
  GET_IMAGE_REGISTRY,
  LIST_IMAGE_REGISTRY_BY_PROJECT_ID,
  UPDATE_IMAGE_REGISTRY,
} from '../../../graphql';
import {
  CreateImageRegistryResponse,
  GetImageRegistryResponse,
  ListImageRegistryResponse,
  UpdateImageRegistryResponse,
} from '../../../models/graphql/imageRegistries';
import { getProjectID } from '../../../utils/getSearchParams';
import useStyles from './styles';

interface RegistryInfo {
  registry_name: string;
  repo_name: string;
  registry_type: string;
  secret_name: string;
  secret_namespace: string;
  enable_registry: boolean;
  is_default: boolean;
}

interface RegistryData {
  registry_name: string;
  repo_name: string;
  registry_type: string;
}

const ImageRegistry = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const projectID = getProjectID();
  const [registry, setRegistry] = useState('enabled');
  const [registryID, setRegistryID] = useState('');
  const [registryType, setRegistryType] = useState('Public');
  const [isCustomRegistryEnabled, setIsCustomRegistryEnabled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  /**
   * GetRegistryData to fetch Registry Data by ID
   */
  const [getRegistryData, { data, loading }] =
    useLazyQuery<GetImageRegistryResponse>(GET_IMAGE_REGISTRY, {
      fetchPolicy: 'network-only',
    });
  const [registryInfo, setRegistryInfo] = useState<RegistryInfo>({
    registry_name: '',
    repo_name: '',
    registry_type: constants.public,
    secret_name: '',
    secret_namespace: '',
    enable_registry: true,
    is_default: true,
  });
  const [registryData, setRegistryData] = useState<RegistryData>({
    registry_name: '',
    repo_name: '',
    registry_type: '',
  });

  /**
   * State variables to manage popover actions
   */
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  /**
   * ListImageRegistry is used to fetch the list of image registries
   */
  const { loading: listLoading } = useQuery<ListImageRegistryResponse>(
    LIST_IMAGE_REGISTRY_BY_PROJECT_ID,
    {
      variables: {
        data: projectID,
      },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        if (
          data.listImageRegistry !== null &&
          data.listImageRegistry.length > 0
        ) {
          setRegistryID(data.listImageRegistry[0].imageRegistryID);
          getRegistryData({
            variables: {
              imageRegistryID: data.listImageRegistry[0].imageRegistryID,
              projectID,
            },
          });
        } else {
          setIsAvailable(false);
          setRegistry('disabled');
        }
      },
    }
  );

  /**
   * UpdateImageRegistry is used to update the Image Registry
   */
  const [updateImageRegistry, { loading: updateLoader }] =
    useMutation<UpdateImageRegistryResponse>(UPDATE_IMAGE_REGISTRY, {
      onCompleted: (data) => {
        if (data.updateImageRegistry.imageRegistryInfo.isDefault) {
          setIsCustomRegistryEnabled(false);
          setRegistry('disabled');
        } else {
          setIsCustomRegistryEnabled(true);
          setRegistry('enabled');
        }
        setRegistryData({
          registry_name:
            data.updateImageRegistry.imageRegistryInfo.imageRegistryName,
          repo_name: data.updateImageRegistry.imageRegistryInfo.imageRepoName,
          registry_type:
            data.updateImageRegistry.imageRegistryInfo.imageRegistryType,
        });
      },
    });

  const [createImageRegistry] = useMutation<CreateImageRegistryResponse>(
    ADD_IMAGE_REGISTRY,
    {
      refetchQueries: [
        {
          query: LIST_IMAGE_REGISTRY_BY_PROJECT_ID,
          variables: {
            data: projectID,
          },
        },
      ],
      onCompleted: (data) => {
        if (data !== undefined) {
          setIsAvailable(true);
        }
      },
      onError: () => {
        setIsAvailable(false);
      },
    }
  );

  /**
   * UseEffect to set the initial data of image registry
   */
  useEffect(() => {
    if (data !== undefined) {
      if (data.getImageRegistry.imageRegistryInfo.isDefault) {
        setRegistry('disabled');
        setIsCustomRegistryEnabled(false);
        setRegistryData({
          registry_name: constants.docker,
          repo_name: constants.litmus,
          registry_type: constants.public,
        });
      } else {
        setRegistry('enabled');
        setIsCustomRegistryEnabled(true);
        setRegistryData({
          registry_name:
            data.getImageRegistry.imageRegistryInfo.imageRegistryName,
          repo_name: data.getImageRegistry.imageRegistryInfo.imageRepoName,
          registry_type:
            data.getImageRegistry.imageRegistryInfo.imageRegistryType,
        });
      }
    }
  }, [data]);

  /**
   * HandleSubmit is used to update the image registry to custom registry
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateImageRegistry({
      variables: {
        imageRegistryID: registryID,
        projectID,
        imageRegistryInfo: {
          imageRegistryName: registryInfo.registry_name,
          imageRepoName: registryInfo.repo_name,
          imageRegistryType: registryInfo.registry_type,
          secretName: registryInfo.secret_name,
          secretNamespace: registryInfo.secret_namespace,
          enableRegistry: true,
          isDefault: false,
        },
      },
    });
  };

  return (
    <div className={classes.container}>
      <Typography className={classes.headerText}>
        {t('settings.imageRegistry.heading')}
      </Typography>
      <Typography className={classes.headerDesc}>
        {t('settings.imageRegistry.headingDesc')}
      </Typography>

      {listLoading && loading ? (
        <Loader />
      ) : (
        <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
          <FormControl component="fieldset" style={{ width: '70%' }}>
            <RadioGroup
              name="image-registry"
              value={registry}
              onChange={(event) => {
                setRegistry(event.target.value);
              }}
            >
              <div className={classes.mainRadioDiv}>
                <FormControlLabel
                  value="disabled"
                  control={
                    <Radio
                      classes={{
                        root: classes.radio,
                        checked: classes.checked,
                      }}
                    />
                  }
                  data-cy="localRadioButton"
                  label={
                    <Typography className={classes.defaultText}>
                      {t('settings.imageRegistry.defaultValues')}
                    </Typography>
                  }
                />
                <Typography className={classes.defaultTextDesc}>
                  {t('settings.imageRegistry.defaultText')}
                </Typography>
                <div className={classes.registryInfoDiv}>
                  <Typography className={classes.registryInfoText}>
                    {t('settings.imageRegistry.registry')}
                    <strong>jfrog.fkinternal.com</strong>
                  </Typography>
                  <Typography className={classes.registryInfoText}>
                    {t('settings.imageRegistry.repo')}
                    <strong>docker-external/litmuschaos</strong>
                  </Typography>
                  <Typography className={classes.registryInfoText}>
                    {t('settings.imageRegistry.repoType')}
                    <strong> {t('settings.imageRegistry.public')}</strong>
                  </Typography>
                </div>
                {!isAvailable ? (
                  <Typography color="error">
                    {t('settings.imageRegistry.noRegistry')}
                  </Typography>
                ) : (
                  <></>
                )}
                {(registry === 'disabled' &&
                  isCustomRegistryEnabled === true) ||
                !isAvailable ? (
                  <div>
                    <ButtonFilled
                      className={classes.defaultBtn}
                      data-cy="disableGitopsButton"
                      disabled={updateLoader}
                      onClick={() =>
                        !isAvailable
                          ? createImageRegistry({
                              variables: {
                                projectID,
                                imageRegistryInfo: {
                                  imageRegistryName: constants.dockerio,
                                  imageRepoName: constants.litmus,
                                  imageRegistryType: constants.public,
                                  secretName: '',
                                  secretNamespace: '',
                                  enableRegistry: true,
                                  isDefault: true,
                                },
                              },
                            })
                          : updateImageRegistry({
                              variables: {
                                imageRegistryID: registryID,
                                projectID,
                                imageRegistryInfo: {
                                  imageRegistryName: constants.dockerio,
                                  imageRepoName: constants.litmus,
                                  imageRegistryType: constants.public,
                                  secretName: '',
                                  secretNamespace: '',
                                  enableRegistry: true,
                                  isDefault: true,
                                },
                              },
                            })
                      }
                    >
                      {t('settings.imageRegistry.defaultReg')}
                    </ButtonFilled>
                  </div>
                ) : null}
              </div>
              <div className={classes.mainRadioDiv}>
                <FormControlLabel
                  value="enabled"
                  control={
                    <Radio
                      classes={{
                        root: classes.radio,
                        checked: classes.checked,
                      }}
                    />
                  }
                  data-cy="localRadioButton"
                  label={
                    <Typography className={classes.defaultText}>
                      {t('settings.imageRegistry.customValues')}
                    </Typography>
                  }
                />

                {isCustomRegistryEnabled ? (
                  <div className={classes.registryInfoDiv}>
                    <Typography className={classes.registryInfoText}>
                      {t('settings.imageRegistry.registry')}
                      <strong>{registryData.registry_name}</strong>
                    </Typography>
                    <Typography className={classes.registryInfoText}>
                      {t('settings.imageRegistry.repo')}
                      <strong>{registryData.repo_name}</strong>
                    </Typography>
                    <Typography className={classes.registryInfoText}>
                      {t('settings.imageRegistry.repoType')}
                      <strong>{registryData.registry_type}</strong>
                    </Typography>
                  </div>
                ) : registry === 'enabled' ? (
                  <>
                    <div className={classes.customDiv}>
                      <InputField
                        label="Custom Registry Server"
                        value={registryInfo.registry_name}
                        className={classes.inputDiv}
                        onChange={(event) => {
                          setRegistryInfo({
                            ...registryInfo,
                            registry_name: event.target.value,
                          });
                        }}
                      />

                      <InputField
                        label="Custom Image Registry"
                        value={registryInfo.repo_name}
                        onChange={(event) => {
                          setRegistryInfo({
                            ...registryInfo,
                            repo_name: event.target.value,
                          });
                        }}
                      />
                    </div>
                    <FormControl
                      variant="outlined"
                      className={classes.formControl}
                    >
                      <InputLabel
                        className={classes.labelText}
                        id="demo-simple-select-helper-label"
                      >
                        {t('settings.imageRegistry.registryLabel')}
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        value={registryType}
                        onChange={(event) => {
                          setRegistryType(event.target.value as string);
                          setRegistryInfo({
                            ...registryInfo,
                            registry_type: event.target.value as string,
                          });
                        }}
                        label="Registry Type"
                      >
                        <MenuItem value="Public">
                          {t('settings.imageRegistry.public')}
                        </MenuItem>
                        <MenuItem value="Private">
                          {t('settings.imageRegistry.private')}
                        </MenuItem>
                      </Select>
                    </FormControl>
                    <br />
                    {registryType === 'Private' && (
                      <>
                        <hr />
                        <div style={{ display: 'flex' }}>
                          <Typography className={classes.additionalDetails}>
                            {t('settings.imageRegistry.additionalInfo')}
                          </Typography>
                          <IconButton
                            className={classes.iconBtn}
                            onClick={handleClick}
                            aria-label="info"
                          >
                            <InfoIcon />
                          </IconButton>
                          <Popover
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'center',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'center',
                            }}
                          >
                            <Typography className={classes.infoText}>
                              {t('settings.imageRegistry.provideInfo')}{' '}
                              <a
                                href="https://kubernetes.io/docs/concepts/configuration/secret/"
                                target="_"
                              >
                                {t('settings.imageRegistry.visit')}
                              </a>
                              .
                            </Typography>
                          </Popover>
                        </div>
                        <div className={classes.customDiv}>
                          <InputField
                            label="Custom Image Secret"
                            value={registryInfo.secret_name}
                            className={classes.inputDiv}
                            onChange={(event) => {
                              setRegistryInfo({
                                ...registryInfo,
                                secret_name: event.target.value,
                              });
                            }}
                          />
                          <InputField
                            label="Secret Namespace"
                            value={registryInfo.secret_namespace}
                            onChange={(event) => {
                              setRegistryInfo({
                                ...registryInfo,
                                secret_namespace: event.target.value,
                              });
                            }}
                          />
                        </div>
                        <br />
                      </>
                    )}
                    <ButtonFilled
                      disabled={
                        registryInfo.registry_name.trim().length === 0 ||
                        registryInfo.repo_name.trim().length === 0
                      }
                      type="submit"
                    >
                      {t('settings.imageRegistry.save')}
                    </ButtonFilled>
                  </>
                ) : null}
              </div>
            </RadioGroup>
          </FormControl>
        </form>
      )}
    </div>
  );
};

export default ImageRegistry;
