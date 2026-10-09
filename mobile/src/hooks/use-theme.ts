import { Theme, Colors } from '../theme';

export function useTheme() {
  return {
    colors: Colors,
    theme: Theme,
  };
}

export default useTheme;
