import React from 'react'
import { Popover, Link } from '@geist-ui/core'

const AvatarMenu = () => (
  <>
    <Popover.Item>
      <Link href="/">Dashboard</Link>
    </Popover.Item>
    <Popover.Item>
      <Link href="/documentation">API Documentation</Link>
    </Popover.Item>
    <Popover.Item line />
    <Popover.Item>
      <Link href='/api/auth/signout'>Logout</Link>
    </Popover.Item>
  </>
)

export default AvatarMenu