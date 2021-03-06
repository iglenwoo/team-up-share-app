import * as React from 'react'
import { Auth, useAuth } from '../../components/FirebaseAuth/use-auth'

export const Landing = () => {
  const { user }: Auth = useAuth()

  return (
    <div>
      <h2>Landing Page</h2>
      {user && <p>user.email: {user.email}</p>}
    </div>
  )
}
