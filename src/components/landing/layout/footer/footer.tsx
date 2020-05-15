import React from "react";
import {LanguagePicker} from "./language-picker";
import {PoweredByLinks} from "./powered-by-links";
import {SocialLink} from "./social-links";
import "./footer.scss";

export const Footer: React.FC = () => {
    return (
        <footer>
            <LanguagePicker/>
            <PoweredByLinks/>
            <SocialLink/>
        </footer>
    );
}
