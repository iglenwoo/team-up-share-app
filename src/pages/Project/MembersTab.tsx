import { default as React, FC, useContext, useEffect, useState } from 'react'
import { ProjectContext } from './index'
import { IDS, INTERESTS, SKILLS } from '../../constants/db.collections'
import { useAsyncEffect } from '../../utils/use-async-effect'
import { Auth, useAuth } from '../../components/FirebaseAuth/use-auth'
import { Id } from '../Profile/Ids'
import {
  createStyles,
  Divider,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core'
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons'
import { MembersList } from './MembersList'
import {
  addIdHash,
  addInterestHash,
  addSkillHash,
  parseToIds,
  parseToInterests,
  parseToSkills,
} from './utils'
import { Invite } from './Invite'
import { Members } from './model'
import { SortedIdTable } from './SortedIdTable'
import { SortedItemTable } from './SortedItemTable'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    project: {
      marginBottom: theme.spacing(2),
    },
    title: {
      // marginTop: theme.spacing(2),
    },
    divider: {
      marginTop: theme.spacing(1),
    },
  })
)

export interface CountableGroup {
  name?: string // todo: refactor to have this value
  count: number
  emails: string[]
}

export interface IDs {
  ids: Id[]
  email: string
}
export interface IdGroup extends Id, CountableGroup {
  values: string[]
}

export interface Skills {
  skills: string[]
  email: string
}
export interface SkillGroup extends CountableGroup {}

export interface Interests {
  interests: string[]
  email: string
}
export interface InterestGroup extends CountableGroup {}

export const MembersTab: FC = () => {
  const { project } = useContext(ProjectContext)
  const { functions }: Auth = useAuth()
  const [allMembers, setAllMembers] = useState<Members>({})
  const [idGroups, setIdGroups] = useState<IdGroup[]>([])
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([])
  const [interestGroups, setInterestGroups] = useState<InterestGroup[]>([])

  useEffect(() => {
    if (Object.keys(project.members).length > 0) {
      setAllMembers(project.members)
    }
  }, [project.members])

  const fetchMemberIds = async () => {
    if (Object.keys(allMembers).length <= 0) return

    try {
      const idHash: { [key: string]: IdGroup } = {}
      const res = await functions.httpsCallable('getMemberDetails')({
        code: project.code,
        target: IDS,
      })
      const idsOfMembers = res.data as IDs[]

      const parsedIds: Id[] = parseToIds(idsOfMembers)
      addIdHash(idHash, parsedIds)

      const groups = Object.values(idHash)
      groups.sort((a, b) => {
        return b.count - a.count
      })
      setIdGroups(groups)
    } catch (e) {
      console.log('Error getting document:', e)
    }
  }

  const fetchMemberSkills = async () => {
    if (Object.keys(allMembers).length <= 0) return

    try {
      const skillHash: { [key: string]: SkillGroup } = {}
      const res = await functions.httpsCallable('getMemberDetails')({
        code: project.code,
        target: SKILLS,
      })
      const skillsList = res.data as Skills[]

      parseToSkills(skillsList)
      addSkillHash(skillHash, skillsList)

      const groups = Object.values(skillHash)
      groups.sort((a, b) => {
        return b.count - a.count
      })
      setSkillGroups(groups)
    } catch (e) {
      console.log('Error getting document:', e)
    }
  }

  const fetchMemberInterests = async () => {
    if (Object.keys(allMembers).length <= 0) return

    try {
      const interestHash: { [key: string]: InterestGroup } = {}
      const res = await functions.httpsCallable('getMemberDetails')({
        code: project.code,
        target: INTERESTS,
      })
      const interestsList = res.data as Interests[]

      parseToInterests(interestsList)
      addInterestHash(interestHash, interestsList)

      const groups = Object.values(interestHash)
      groups.sort((a, b) => {
        return b.count - a.count
      })
      setInterestGroups(groups)
    } catch (e) {
      console.log('Error getting document:', e)
    }
  }

  useAsyncEffect(async () => {
    await fetchMemberIds()
    await fetchMemberSkills()
    await fetchMemberInterests()
  }, [allMembers])

  const classes = useStyles()

  return (
    <>
      <Typography variant="h5" className={classes.project}>
        Project Code: {project.code}
      </Typography>
      {project.isOwned && <Invite />}
      <MembersList members={allMembers} />
      <Divider className={classes.divider} />
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          id="service-accounts"
        >
          <Typography variant="h5" className={classes.title}>
            Service Accounts
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <SortedIdTable idGroups={idGroups} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          id="technical-skills"
        >
          <Typography variant="h5" className={classes.title}>
            Technical Skills
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <SortedItemTable groups={skillGroups} itemTitle="Skill" />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          id="technical-skills"
        >
          <Typography variant="h5" className={classes.title}>
            Interests
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <SortedItemTable groups={interestGroups} itemTitle="Interest" />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </>
  )
}
