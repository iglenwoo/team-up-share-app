import * as React from 'react'
import { FC } from 'react'
import { Redirect } from 'react-router-dom'
import { Auth, useAuth } from '../../components/FirebaseAuth/use-auth'
import {
  Box,
  Container,
  createStyles,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core'
import { Ids } from './Ids'
import { Skills } from './Skills'
import { SIGN_IN } from '../../constants/routes'
import { Interests } from './Interests'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
    },
  })
)

export const Profile: FC = () => {
  const { user }: Auth = useAuth()

  const classes = useStyles()

  if (user === null) {
    return <Redirect to={SIGN_IN} />
  }

  return (
    <Container component="main" maxWidth="lg">
      <Paper className={classes.root}>
        <Typography gutterBottom variant="h6">
          Profile
        </Typography>
        <Box ml={1}>
          <Typography gutterBottom variant="body1">
            Email: {user.email}
          </Typography>
        </Box>
      </Paper>
      <Ids />
      <Skills />
      <Interests />
    </Container>
  )
}
