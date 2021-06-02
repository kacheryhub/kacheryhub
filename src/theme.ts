import { brown, lime } from '@material-ui/core/colors';
import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';


const themeOptions: ThemeOptions = {
    palette: {
        primary: brown,
        secondary: lime,
    }
}

const theme = createMuiTheme(themeOptions);

export default theme;