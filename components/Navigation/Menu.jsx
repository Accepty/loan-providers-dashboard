import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Avatar, Popover, useTheme } from '@geist-ui/core'
import ButtonRound from '@/components/Button/Round'
import { getInitials } from '@/helpers/utils'
import Submenu from './Submenu'
import AvatarMenu from './AvatarMenu'
import styles from './Menu.module.css'

import Moon from '@geist-ui/icons/moon'
import Sun from '@geist-ui/icons/sun'

const NavigationMenu = ({ switchTheme }) => {
  const theme = useTheme()
  const { data: session } = useSession()

  return (
    <>
      <nav className={styles.menuNav} style={{ backgroundColor: theme.palette.background }}>
        <Image
          className="logo__image"
          src={`/static/images/${(theme.type === 'darkAccepty') ? 'logoWhite.png' : 'logoBlack.svg'}`}
          height={28}
          width={123.89}
          alt="Accepty Logo"
        />
        <div>
          <ButtonRound
            aria-label="Toggle Dark mode"
            auto
            icon={(theme.type === 'darkAccepty') ? <Sun /> : <Moon />}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 8pt" }}
            onClick={() => switchTheme()}
            type="abort"
          />
          <Popover content={<AvatarMenu />} placement="bottomEnd">
            <button className={styles.avatarMenu__button}>
              <Avatar text={getInitials(session?.user.name || '')} />
            </button>
          </Popover>
        </div>
      </nav>
      <Submenu />
      <style jsx>{`
        .logo__image {
          margin-right: auto;
        }
      `}</style>
    </>
  )
}

export default NavigationMenu
