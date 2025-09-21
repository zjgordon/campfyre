import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

export const useResponsive = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
  };
};

export default useResponsive;
