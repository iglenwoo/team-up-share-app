import {
  default as React,
  FC,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react'
import {
  createStyles,
  makeStyles,
  Card,
  Theme,
  Typography,
  CardContent,
  Box,
  IconButton,
  TextField,
} from '@material-ui/core'
import { AddCircle as AddCircleIcon } from '@material-ui/icons'
import { Auth, useAuth } from '../../components/FirebaseAuth/use-auth'
import { INTERESTS } from '../../constants/db.collections'
import { EditableChips } from '../../components/EditableChips'
import { Loading } from '../../components/Loading'
import { HtmlTooltip } from './Ids'
import { InfoIcon } from './InfoIcon'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
    button: {
      minWidth: 100,
      maxHeight: 36,
      marginLeft: theme.spacing(1),
    },
    interest: {
      minWidth: 50,
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
    action: {
      marginLeft: theme.spacing(1),
    },
  })
)

export const Interests: FC = () => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { user, firestore }: Auth = useAuth()
  const [interests, setInterests] = useState<string[]>([])
  const [editingInterests, setEditingInterests] = useState<string[]>([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newInterest, setNewInterest] = useState<string>('')

  useEffect(() => {
    if (!user || !user.email) return

    firestore
      .collection(INTERESTS)
      .doc(user.email)
      .get()
      .then(doc => {
        const data = doc.data()
        if (data && data.interests) {
          setInterests(data.interests)
          setEditingInterests(data.interests)
        }
      })
      .catch(error => {
        console.log('Error getting document:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user, firestore])

  useEffect(() => {
    if (!editing || interests === editingInterests || !user || !user.email)
      return
    setLoading(true)
    firestore
      .collection(INTERESTS)
      .doc(user.email)
      .set({ interests: editingInterests, email: user.email })
      .then(() => {
        setInterests(editingInterests)
      })
      .catch(error => {
        console.error('Error updating interests:', error)
      })
      .finally(() => {
        setEditing(false)
        setLoading(false)
      })
  }, [editing, editingInterests, firestore, interests, user])

  const _addInterest = () => {
    if (!newInterest) return

    const loweredEditingInterests = editingInterests.map(i => i.toLowerCase())
    if (loweredEditingInterests.includes(newInterest.toLowerCase())) {
      enqueueSnackbar(`Interest "${newInterest}" already exists.`, {
        variant: 'error',
      })
      return
    }

    const newEditingInterests = [...editingInterests, newInterest]
    setEditingInterests(newEditingInterests)
    setNewInterest('')
    setEditing(true)
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      _addInterest()
    }
  }

  const handleAddClick = () => {
    _addInterest()
  }

  const handleDeleteClick = (e: SyntheticEvent, interestToDelete: string) => {
    const newInterests = editingInterests.filter(i => i !== interestToDelete)
    setEditingInterests(newInterests)
    setEditing(true)
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" display="inline" gutterBottom>
          Interests
          <HtmlTooltip placement="right-start" title={renderTitle()}>
            <Typography display="inline">
              <InfoIcon />
            </Typography>
          </HtmlTooltip>
        </Typography>
        {loading ? (
          <Loading />
        ) : (
          <Box display="flex" flexWrap="wrap" alignItems="center">
            <EditableChips
              chips={interests}
              editingChips={editingInterests}
              onDelete={handleDeleteClick}
              editing={true}
            />
            <Box className={classes.interest}>
              <TextField
                variant="outlined"
                margin="dense"
                label="New interest"
                placeholder="Software Development"
                value={newInterest}
                onChange={e => setNewInterest(e.currentTarget.value)}
                onKeyPress={handleKeyDown}
              />
              <IconButton
                edge="end"
                aria-label="add"
                color="primary"
                className={classes.action}
                onClick={handleAddClick}
              >
                <AddCircleIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

const renderTitle = () => (
  <>
    <Typography color="inherit">Interests:</Typography>
    <b>Add what you are passion/interested about here.</b>
    <br />
    <i>e.g. Coffee, Reading, Drawing, Sports, ...</i>
    <br />
    This will help you to share them with other team members in a project.
  </>
)
