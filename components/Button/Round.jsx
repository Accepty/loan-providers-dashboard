import { Button } from '@geist-ui/core'
import styles from './ButtonRound.module.css'

const ButtonRound = ({ icon, ...props }) => (
  <Button className={styles.button} icon={icon} {...props} />
)

export default ButtonRound
