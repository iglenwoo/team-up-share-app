import { FC, default as React, useContext, useState } from 'react'
import { ProjectContext } from './index'
import { useAuth } from '../../components/FirebaseAuth/use-auth'
import { useAsyncEffect } from '../../utils/use-async-effect'
import * as firebase from 'firebase'
import { DOCUMENTS, PROJECTS } from '../../constants/routes'
import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core'
import { CloudUpload as CloudUploadIcon } from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import { Loading } from '../../components/Loading'
import { DocumentList } from './DocumentList'

export interface Document {
  contextType: string
  mediaLink: string
  name: string
  path: string
  size: string
  updatedAt: firebase.firestore.Timestamp
  updatedBy: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    project: {
      marginBottom: theme.spacing(2),
    },
    fieldContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'top',
      flexWrap: 'wrap',
    },
    input: {
      display: 'none',
    },
    button: {
      minWidth: 150,
    },
  })
)

export const DocumentsTab: FC = () => {
  const { loading, project } = useContext(ProjectContext)
  const { firestore, storage, user } = useAuth()
  const storageRef = storage.ref()
  const { enqueueSnackbar } = useSnackbar()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isDocLoading, setIsDocLoading] = useState(true)

  const fetchDocs = async () => {
    if (!project.code) return

    try {
      setIsDocLoading(true)

      firestore
        .collection(PROJECTS)
        .doc(project.code)
        .collection(DOCUMENTS)
        .onSnapshot(snapshot => {
          const newDocs: Document[] = []
          snapshot.forEach(result => {
            const data = result.data()
            const document = data as Document
            newDocs.push(document)
          })
          setDocuments(newDocs)
          setIsDocLoading(false)
        })
    } catch (e) {
      console.log('Error getting document:', e)
      setIsDocLoading(false)
    }
  }

  useAsyncEffect(fetchDocs, [project.code])

  const handleUpload = (files: FileList | null) => {
    if (!files || !files.length) return

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i)
      if (!file) {
        continue
      }
      const fileRef = storageRef.child(`${project.code}/${file.name}`)
      const metadata: firebase.storage.UploadMetadata = {
        customMetadata: {
          project: project.code,
          fileName: file.name,
          updatedBy: user && user.email ? user.email : '',
        },
      }

      enqueueSnackbar(`${file.name} uploading...`, { variant: 'default' })
      fileRef
        .put(file, metadata)
        .then(() => {
          enqueueSnackbar(`${file.name} uploading succeeded!`, {
            variant: 'success',
          })
        })
        .finally(() => {
          setIsDocLoading(true)
        })
    }
  }

  const classes = useStyles()
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Typography variant="h5" className={classes.project}>
            Project Code: {project.code}
          </Typography>
          <Box className={classes.fieldContainer} mb={2} mx={1}>
            <input
              className={classes.input}
              id="contained-button-file"
              multiple
              onChange={e => handleUpload(e.currentTarget.files)}
              onClick={e => {
                e.currentTarget.value = ''
              }}
              type="file"
            />
            <label htmlFor="contained-button-file">
              <Button
                className={classes.button}
                variant="contained"
                component="span"
                color="secondary"
                startIcon={<CloudUploadIcon />}
              >
                Upload
              </Button>
            </label>
          </Box>
          <Box m={2}>
            {isDocLoading ? (
              <Loading />
            ) : (
              <DocumentList
                documents={documents}
                setIsDocLoading={setIsDocLoading}
              />
            )}
          </Box>
        </>
      )}
    </>
  )
}
