import * as React from 'react'
import { FC, useContext } from 'react'
import { Box, CircularProgress } from '@material-ui/core'
import { ProjectContext } from './index'

export interface Project {
  code: string
  owner: string
  members: string[]
}

export const ProjectInfoTab: FC = () => {
  const { loading, project } = useContext(ProjectContext)

  // todo: Show project details
  // todo: Edit project details

  return (
    <Box>
      {loading ? (
        <Box display="flex" alignItems="center">
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <div>
          <h2>Project: {project.code}</h2>
          <h5>Owner: {project.owner}</h5>
          <MembersList members={project.members} />
        </div>
      )}
    </Box>
  )
}

const MembersList: FC<{
  members: string[]
}> = props => {
  return props.members ? (
    <>
      <h2>Member</h2>
      {props.members.map((p, i) => (
        <h5 key={`${p}-${i}`}>{p}</h5>
      ))}
    </>
  ) : (
    <div>No member...</div>
  )
}