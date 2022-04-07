import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { ThemeSwitch } from '../../theme'
import { Typography } from '@mui/material'
import { makeStyles } from '../../utils'
import { Main } from './Main'

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
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
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}))

export const App = () => {
  const { classes } = useStyles()
  return (
    <>
      <AppBar>
        <Toolbar className={classes.toolbar}>
          <Typography className={classes.title} noWrap>{`react-svg-timeline – v${
            import.meta.env.VITE_APP_VERSION
          }`}</Typography>
          <ThemeSwitch />
        </Toolbar>
      </AppBar>
      <div className={classes.main}>
        <Main />
      </div>
    </>
  )
}
