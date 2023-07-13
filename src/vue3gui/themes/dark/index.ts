import { Theme } from "../../Theme"
import { DARK_THEME as orig } from "../../theme/dark"
import style from "./style.scss"

/** @deprecated Use `theme/dark.ts` */
export const DARK_THEME = Theme.selected = {
    ...orig,
    style
}
