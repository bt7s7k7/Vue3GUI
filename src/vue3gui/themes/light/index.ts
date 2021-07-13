import style from "../../style.scss"
import { Theme } from "../../Theme"

export const LIGHT_THEME: Theme = {
    name: "light",
    highlight: "primary",
    background: "white",
    object: "secondary",
    overlay: "secondary",
    inset: "white",
    border: "default",
    style
}

if (Theme) Theme.selected = LIGHT_THEME