import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { ThemeSwitch } from '../../theme'
import { makeStyles } from '../../utils'
import { Main } from './Main'

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    display: 'grid',
    justifyItems: 'end',
  },
  title: {
    [theme.breakpoints.down('md')]: {
      fontSize: theme.typography.caption.fontSize,
    },
  },
  main: {
    display: 'grid',
    height: '100vh',
    width: '100vw',
    gridTemplateRows: 'auto 1fr',
    gridRowGap: 8,
    paddingTop: 100,
    paddingLeft: '2vw',
    paddingRight: '2vw',
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
}))

export const App = () => {
  const { classes } = useStyles()
  return (
    <>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <ThemeSwitch />
        </Toolbar>
      </AppBar>
      <div className={classes.main}>
        <Main />
      </div>
    </>
  )
}
