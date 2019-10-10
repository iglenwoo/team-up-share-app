import React from 'react'
import { Container, Typography, Box } from '@material-ui/core'
import ProTip from '../components/ProTip'
import Copyright from '../components/Copyright'

export default function Dashboard() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  )
}
