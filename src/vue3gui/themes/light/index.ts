import { Theme } from "../../Theme"
import style from "../../style.scss"
import { LIGHT_THEME as orig } from "../../theme/light"

/** @deprecated Use `theme/light.ts` */
export const LIGHT_THEME = Theme.selected = {
    ...orig,
    style
}
