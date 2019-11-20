import * as React from 'react'
import {
  Card,
  CardContent,
  Container,
  createStyles,
  makeStyles,
  Tab,
  Tabs,
  Theme,
  Typography,
} from '@material-ui/core'
import { ProjectInfo } from './ProjectInfo'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      marginTop: theme.spacing(1),
    },
  })
)

interface TabPanelProps {
  children?: React.ReactNode
  index: any
  value: any
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  const classes = useStyles()

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      <Card className={classes.card}>
        <CardContent>{children}</CardContent>
      </Card>
    </Typography>
  )
}

const a11yProps = (index: number) => {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  }
}

const tabs = [
  { label: 'Info', index: 0, child: <ProjectInfo /> },
  { label: 'Documents', index: 1, child: <div>Documents</div> }, // TODO
  { label: 'Members', index: 2, child: <div>Members</div> }, // TODO
]

export const Project = () => {
  const [tabIndex, setTabIndex] = React.useState<number>(0)

  const handleChange = (event: React.ChangeEvent<{}>, newIndex: number) => {
    setTabIndex(newIndex)
  }

  const tabItems = tabs.map(tab => (
    <Tab
      value={tab.index}
      label={tab.label}
      {...a11yProps(tab.index)}
      key={`tab-${tab.index}`}
    />
  ))

  const tabPanels = tabs.map(tab => {
    return (
      <TabPanel
        value={tabIndex}
        index={tab.index}
        key={`tabpanel-${tab.index}`}
      >
        {tab.child}
      </TabPanel>
    )
  })

  return (
    <Container component="main" maxWidth="lg">
      <Tabs
        value={tabIndex}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        {tabItems}
      </Tabs>
      {tabPanels}
    </Container>
  )
}